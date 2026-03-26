import {
    Injectable,
    Logger,
    InternalServerErrorException,
    RequestTimeoutException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PdfChunkRepository } from '../pdf/repositories/pdf-chunk.repository';
import { PDF_QA_PROMPT } from './prompts/pdf-qa.prompt';
import { PdfQaDto } from './dto/pdf-qa.dto';
import { LongQuestionDto } from './dto/long-question.dto';
import { LONG_QUESTION_PROMPT } from './prompts/long-question.prompt';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';
import { STORAGE_TOKEN, StorageService } from '../../infrastructure/storage/storage.interface';
import { Inject } from '@nestjs/common';

export interface AiCompletionResult {
    content: string;
    tokensUsed: number;
}

interface GenerateCompletionOptions {
    timeoutMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    maxTokens?: number;
    temperature?: number;
}

/**
 * AiService — AI abstraction layer
 *
 * This is the SINGLE point of contact for all AI operations in Willofire.
 * It encapsulates the `openai` SDK, which is compatible with both native
 * OpenAI and Azure OpenAI endpoints via configuration.
 *
 * Two distinct Azure OpenAI clients are used:
 *  - llmClient   → chat completions  (LLM_* vars, deployment-scoped URL)
 *  - embedClient → text embeddings   (OPENAI_* vars, separate Azure endpoint)
 */
@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly llmClient: OpenAI;
    private readonly embedClient: OpenAI;
    private readonly defaultModel: string;
    private readonly defaultEmbeddingModel: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly pdfChunkRepository: PdfChunkRepository,
        private readonly pdfGeneratorService: PdfGeneratorService,
        @Inject(STORAGE_TOKEN) private readonly storageService: StorageService,
    ) {
        // ── LLM client (Azure OpenAI — chat completions) ────────────────────
        const llmApiKey = this.configService.get<string>('ai.llm.apiKey');
        const llmBaseURL = this.configService.get<string>('ai.llm.baseURL');
        const llmApiVer = this.configService.get<string>('ai.llm.apiVersion') ?? '2024-12-01-preview';
        const llmDeployment = this.configService.get<string>('ai.llm.deployment') ?? 'gpt-4.1';

        if (!llmApiKey) {
            this.logger.warn('LLM_API_KEY is not set. Chat completion features will fail.');
        }

        // Azure routes by deployment, so we hard-scope the base URL to the deployment path.
        this.llmClient = new OpenAI({
            apiKey: llmApiKey ?? '',
            baseURL: `${llmBaseURL}/openai/deployments/${llmDeployment}`,
            defaultQuery: { 'api-version': llmApiVer },
            defaultHeaders: { 'api-key': llmApiKey ?? '' },
        });

        // The model name sent in the request body is ignored by Azure when routing via
        // the deployment URL — use the deployment name as a human-readable label only.
        this.defaultModel = llmDeployment;

        // ── Embed client (separate Azure OpenAI endpoint — embeddings) ───────
        const embedApiKey = this.configService.get<string>('ai.embed.apiKey');
        const embedBaseURL = this.configService.get<string>('ai.embed.baseURL');

        if (!embedApiKey) {
            this.logger.warn('OPENAI_API_KEY (embed endpoint) is not set. Embedding features will fail.');
        }

        this.embedClient = new OpenAI({
            apiKey: embedApiKey ?? '',
            baseURL: embedBaseURL,
            defaultHeaders: { 'api-key': embedApiKey ?? '' },
        });

        this.defaultEmbeddingModel = this.configService.get<string>('ai.embed.model') ?? 'text-embedding-3-small';

        this.logger.log(`AiService initialized. LLM deployment: ${this.defaultModel}, Embed model: ${this.defaultEmbeddingModel}`);
    }

    /**
     * Generate a text completion from a structured array of messages.
     * Use this for all prompt template evaluations.
     */
    async generateCompletion(
        messages: ChatCompletionMessageParam[],
        modelOverride?: string,
        options?: GenerateCompletionOptions,
    ): Promise<AiCompletionResult> {
        const model = modelOverride || this.defaultModel;
        const timeoutMs = options?.timeoutMs ?? this.configService.get<number>('ai.llm.timeoutMs') ?? 120_000;
        const maxRetries = options?.maxRetries ?? this.configService.get<number>('ai.llm.maxRetries') ?? 2;
        const retryDelayMs = options?.retryDelayMs ?? this.configService.get<number>('ai.llm.retryDelayMs') ?? 1_500;
        const maxTokens = options?.maxTokens ?? this.configService.get<number>('ai.llm.maxTokens') ?? 1_500;
        const temperature = options?.temperature ?? 0.2;

        try {
            if (this.configService.get('NODE_ENV') !== 'production') {
                this.logger.debug(`Sending ${messages.length} messages to model ${model}...`);
                this.logger.debug(`Prompt Content: ${messages[messages.length - 1].content} `);
            }

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                const controller = new AbortController();
                const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

                try {
                    const response = await this.llmClient.chat.completions.create(
                        {
                            model,
                            messages,
                            temperature, // Low temperature for factual output
                            max_tokens: maxTokens,
                        },
                        { signal: controller.signal },
                    ) as OpenAI.Chat.Completions.ChatCompletion;

                    const content = response.choices[0]?.message?.content || '';
                    const tokensUsed = response.usage?.total_tokens || 0;

                    if (this.configService.get('NODE_ENV') !== 'production') {
                        this.logger.debug(`generateCompletion success. Model: ${model}, Tokens: ${tokensUsed} `);
                    }

                    return {
                        content,
                        tokensUsed,
                    };
                } catch (error) {
                    const normalizedError = this.normalizeProviderError(error, timeoutMs);
                    const isLastAttempt = attempt >= maxRetries;
                    const shouldRetry = !isLastAttempt && this.isRetryableProviderError(normalizedError);

                    if (shouldRetry) {
                        const delay = retryDelayMs * Math.pow(2, attempt);
                        this.logger.warn(
                            `AI request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms. Reason: ${normalizedError.message}`,
                        );
                        await this.sleep(delay);
                        continue;
                    }

                    throw normalizedError;
                } finally {
                    clearTimeout(timeoutHandle);
                }
            }

            throw new InternalServerErrorException('Failed to generate AI response');
        } catch (error) {
            this.logger.error(`AI completion failed: ${(error as Error).message} `, (error as Error).stack);
            if (error instanceof RequestTimeoutException || error instanceof ServiceUnavailableException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to generate AI response');
        }
    }

    private normalizeProviderError(error: unknown, timeoutMs: number): Error {
        if (error instanceof RequestTimeoutException || error instanceof ServiceUnavailableException) {
            return error;
        }

        const e = error as {
            message?: string;
            name?: string;
            code?: string;
            status?: number;
            cause?: { code?: string };
        };

        const message = e.message ?? 'Unknown AI provider error';
        const loweredMessage = message.toLowerCase();
        const status = e.status;
        const code = e.code ?? e.cause?.code;
        const name = e.name ?? '';

        const timedOut = loweredMessage.includes('timeout')
            || loweredMessage.includes('timed out')
            || code === 'ETIMEDOUT'
            || code === 'UND_ERR_CONNECT_TIMEOUT'
            || name === 'AbortError'
            || status === 408;

        if (timedOut) {
            return new RequestTimeoutException(`AI request timed out after ${Math.floor(timeoutMs / 1000)} seconds`);
        }

        const retryableHttpStatus = status !== undefined && [429, 500, 502, 503, 504].includes(status);
        const retryableNetworkError = ['ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN'].includes(code ?? '');

        if (retryableHttpStatus || retryableNetworkError) {
            return new ServiceUnavailableException(`AI provider temporarily unavailable: ${message}`);
        }

        return new InternalServerErrorException('Failed to generate AI response');
    }

    private isRetryableProviderError(error: Error): boolean {
        return error instanceof RequestTimeoutException || error instanceof ServiceUnavailableException;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generate text embeddings for a given input string.
     * Returns the raw vector array.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.embedClient.embeddings.create({
                model: this.defaultEmbeddingModel,
                input: text,
            });

            const vector = response.data[0]?.embedding;

            if (!vector) {
                throw new Error('No embedding returned from provider');
            }

            return vector;
        } catch (error) {
            this.logger.error(`AI embedding failed: ${(error as Error).message} `, (error as Error).stack);
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

    /**
     * POST /api/v1/ai/long-question/download
     * Implements Phase 10 Step 10.2: AI-generated Long Question PDF download.
     */
    async generateLongQuestionPdf(dto: LongQuestionDto): Promise<{ downloadUrl: string }> {
        const { pdfId, count, marks } = dto;
        this.logger.log(`Generating ${count} long questions(${marks} marks each) for PDF ${pdfId}`);

        // 1. Fetch chunks in reading order
        const chunks = await this.pdfChunkRepository.findByPdfId(pdfId);

        if (!chunks || chunks.length === 0) {
            throw new InternalServerErrorException('No text chunks found for this PDF. Is it still processing?');
        }

        // 2. Select chunks (Naive approach: first 10 chunks to get enough context for questions)
        const maxChunks = 10;
        const selectedChunks = chunks.slice(0, maxChunks);

        const contextString = selectedChunks.map(c => c.content).join('\n\n');

        // 3. Render prompt
        const userPrompt = LONG_QUESTION_PROMPT.render({
            context: contextString,
            count,
            marks,
        });

        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: LONG_QUESTION_PROMPT.system },
            { role: 'user', content: userPrompt },
        ];

        // 4. Generate completion
        const result = await this.generateCompletion(messages);

        // 5. Parse JSON
        let questions: { text: string; marks: number }[] = [];
        try {
            // Scrub markdown fences just in case the AI ignored instructions
            let jsonString = result.content.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.slice(7, -3).trim();
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.slice(3, -3).trim();
            }
            questions = JSON.parse(jsonString);
        } catch (error) {
            this.logger.error(`Failed to parse AI JSON response: ${result.content}`);
            throw new InternalServerErrorException('AI returned invalid question format');
        }

        // 6. Generate PDF Buffer
        const pdfBuffer = await this.pdfGeneratorService.generateLongQuestionPdf(
            `Subjective Assignment (${marks} marks/Q)`,
            questions
        );

        // 7. Upload to Azure
        const fileName = `subjective-${Date.now()}.pdf`;
        const uploadResult = await this.storageService.uploadFile(pdfBuffer, fileName, 'application/pdf', 'generated');

        return { downloadUrl: uploadResult.publicUrl };
    }
}
