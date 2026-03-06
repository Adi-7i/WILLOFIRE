import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PdfChunkRepository } from '../pdf/repositories/pdf-chunk.repository';
import { PDF_QA_PROMPT } from './prompts/pdf-qa.prompt';
import { PdfQaDto } from './dto/pdf-qa.dto';

export interface AiCompletionResult {
    content: string;
    tokensUsed: number;
}

/**
 * AiService — AI abstraction layer
 *
 * This is the SINGLE point of contact for all AI operations in Willofire.
 * It encapsulates the `openai` SDK, which is compatible with both native
 * OpenAI and Azure OpenAI endpoints via configuration.
 */
@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly openai: OpenAI;
    private readonly defaultModel: string;
    private readonly defaultEmbeddingModel: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly pdfChunkRepository: PdfChunkRepository,
    ) {
        const apiKey = this.configService.get<string>('ai.openaiApiKey');

        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY is not set. AI features will fail.');
        }

        this.openai = new OpenAI({ apiKey });
        this.defaultModel = this.configService.get<string>('ai.model') ?? 'gpt-4o-mini';
        this.defaultEmbeddingModel = this.configService.get<string>('ai.embeddingModel') ?? 'text-embedding-3-small';

        this.logger.log(`AiService initialized. Default model: ${this.defaultModel}`);
    }

    /**
     * Generate a text completion from a structured array of messages.
     * Use this for all prompt template evaluations.
     */
    async generateCompletion(
        messages: ChatCompletionMessageParam[],
        modelOverride?: string,
    ): Promise<AiCompletionResult> {
        const model = modelOverride || this.defaultModel;

        try {
            const response = await this.openai.chat.completions.create({
                model,
                messages,
                temperature: 0.1, // Low temp for deterministic Q&A by default
            });

            const content = response.choices[0]?.message?.content || '';
            const tokensUsed = response.usage?.total_tokens || 0;

            this.logger.debug(`generateCompletion success. Model: ${model}, Tokens: ${tokensUsed}`);

            return {
                content,
                tokensUsed,
            };
        } catch (error) {
            this.logger.error(`AI completion failed: ${(error as Error).message}`, (error as Error).stack);
            throw new InternalServerErrorException('Failed to generate AI response');
        }
    }

    /**
     * Generate text embeddings for a given input string.
     * Returns the raw vector array.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.defaultEmbeddingModel,
                input: text,
            });

            const vector = response.data[0]?.embedding;

            if (!vector) {
                throw new Error('No embedding returned from provider');
            }

            return vector;
        } catch (error) {
            this.logger.error(`AI embedding failed: ${(error as Error).message}`, (error as Error).stack);
            throw new InternalServerErrorException('Failed to generate AI embedding');
        }
    }

    /**
     * POST /api/v1/ai/pdf-qa
     * Implements Phase 7 Step 7.2: PDF-based Q&A without embeddings (naive chunk selection)
     */
    async answerFromPdf(dto: PdfQaDto) {
        const { pdfId, question } = dto;

        // 1. Fetch chunks in reading order
        const chunks = await this.pdfChunkRepository.findByPdfId(pdfId);

        if (!chunks || chunks.length === 0) {
            throw new InternalServerErrorException('No text chunks found for this PDF. Is it still processing?');
        }

        // 2. Select chunks (Naive approach: first N chunks)
        const maxChunks = this.configService.get<number>('ai.maxChunks') ?? 5;
        const selectedChunks = chunks.slice(0, maxChunks);

        // 3. Build context string and track sources
        const contextParts: string[] = [];
        const sourcePages = new Set<number>();

        for (const chunk of selectedChunks) {
            contextParts.push(chunk.content);
            sourcePages.add(chunk.pageNumber);
        }

        const contextString = contextParts.join('\n\n');

        // 4. Render prompt
        const userPrompt = PDF_QA_PROMPT.render({
            context: contextString,
            question,
        });

        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: PDF_QA_PROMPT.system },
            { role: 'user', content: userPrompt },
        ];

        // 5. Generate completion
        const result = await this.generateCompletion(messages);

        // 6. Return structured response
        return {
            answer: result.content,
            sources: Array.from(sourcePages).sort((a, b) => a - b),
            promptVersion: PDF_QA_PROMPT.version,
            tokensUsed: result.tokensUsed,
        };
    }
}
