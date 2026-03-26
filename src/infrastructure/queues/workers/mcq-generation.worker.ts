import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { MCQ_GENERATION_QUEUE } from '../queue.constants';
import { McqGenerationPayload } from '../queue.service';
import { AiService } from '../../../modules/ai/ai.service';
import { MCQ_GENERATION_PROMPT } from '../../../modules/ai/prompts/mcq-generation.prompt';
import { PdfChunkRepository } from '../../../modules/pdf/repositories/pdf-chunk.repository';
import { McqTestRepository } from '../../../modules/mcq/repositories/mcq-test.repository';

/**
 * McqGenerationWorker
 *
 * Reads chunks from the database and coordinates with AI (OpenAI API)
 * to generate rigorous MCQs, then commits them back to MongoDB.
 *
 * Phase 5: Sets up the worker shell and confirms the queue is reachable.
 */
@Injectable()
export class McqGenerationWorker implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(McqGenerationWorker.name);
    private worker!: Worker<McqGenerationPayload, string, string>;

    constructor(
        private readonly config: ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly aiService: AiService,
        private readonly pdfChunkRepository: PdfChunkRepository,
        private readonly mcqTestRepository: McqTestRepository,
    ) { }

    onModuleInit() {
        const enabled = this.config.get<boolean>('queue.enabled') ?? true;
        if (!enabled) {
            this.logger.warn(`Queue disabled; skipping worker init for: ${MCQ_GENERATION_QUEUE}`);
            return;
        }

        this.logger.log(`Initializing worker for queue: ${MCQ_GENERATION_QUEUE}`);

        this.worker = new Worker(
            MCQ_GENERATION_QUEUE,
            async (job: Job<McqGenerationPayload>) => {
                return this.processJob(job);
            },
            {
                connection: this.redis,
                concurrency: 5, // AI API calls are mostly network wait time, so higher concurrency is fine
            },
        );

        this.worker.on('failed', (job, err) => {
            this.logger.error(`MCQ Generation Job [${job?.id}] failed:`, err.message);
        });

        this.worker.on('error', (err) => {
            this.logger.error('MCQ Worker experienced a general error:', err);
        });
    }

    async onApplicationShutdown() {
        this.logger.log(`Closing worker: ${MCQ_GENERATION_QUEUE}`);
        await this.worker?.close();
    }

    private async processJob(job: Job<McqGenerationPayload>): Promise<string> {
        const { pdfId, userId, numQuestions, difficulty } = job.data;
        this.logger.log(
            `[McqWorker] Start generating ${numQuestions} ${difficulty} questions for PDF ${pdfId} | User ${userId}`,
        );

        try {
            // 1. Fetch chunks in reading order
            const chunks = await this.pdfChunkRepository.findByPdfId(pdfId);
            if (!chunks || chunks.length === 0) {
                throw new Error('No text chunks found for this PDF. Wait for processing to finish.');
            }

            // 2. Take max chunks for context window
            // Naive approach: take the first 5 elements for Phase 8.
            const selectedChunks = chunks.slice(0, 5);
            const contextString = this.buildBoundedContext(selectedChunks.map((c) => c.content), 12_000);

            // 3. Render prompt
            const userPrompt = MCQ_GENERATION_PROMPT.render({
                context: contextString,
                count: numQuestions,
                difficulty,
            });

            // 4. Generate completion
            const result = await this.aiService.generateCompletion(
                [
                    { role: 'system', content: MCQ_GENERATION_PROMPT.system },
                    { role: 'user', content: userPrompt },
                ],
                undefined,
                { timeoutMs: 60_000, maxRetries: 1, retryDelayMs: 1_000, maxTokens: 1_500 },
            );

            // 5. Parse and normalize questions from AI JSON (with repair fallback)
            const questions = await this.parseQuestionsWithRepair(result.content);

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('AI output was not a valid or populated JSON array.');
            }

            // 7. Persist to Database
            const testTitle = `Generated ${difficulty} MCQ Test (${questions.length} Qs)`;
            const mcqTest = await this.mcqTestRepository.create({
                userId,
                pdfId,
                title: testTitle,
                questions,
                totalQuestions: questions.length,
            });

            this.logger.log(`[McqWorker] Successfully generated and saved McqTest ${mcqTest._id}`);
            return `Created McqTest ${mcqTest._id} with ${questions.length} questions.`;

        } catch (error) {
            this.logger.error(`[McqWorker] Failed generation for PDF ${pdfId}: ${(error as Error).message}`, (error as Error).stack);
            throw error; // Let BullMQ retry
        }
    }

    private buildBoundedContext(chunks: string[], maxChars: number): string {
        const parts: string[] = [];
        let used = 0;

        for (const chunk of chunks) {
            if (!chunk) continue;
            if (used >= maxChars) break;

            const remaining = maxChars - used;
            const take = chunk.length > remaining ? chunk.slice(0, remaining) : chunk;
            parts.push(take);
            used += take.length;
        }

        return parts.join('\n\n');
    }

    private stripMarkdownFence(raw: string): string {
        const trimmed = raw.trim();
        if (trimmed.startsWith('```json')) return trimmed.replace(/^```json/, '').replace(/```$/, '').trim();
        if (trimmed.startsWith('```')) return trimmed.replace(/^```/, '').replace(/```$/, '').trim();
        return trimmed;
    }

    private extractFirstJsonArray(raw: string): string {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1 || end <= start) return raw;
        return raw.slice(start, end + 1);
    }

    private normalizeQuestions(input: unknown): Array<{
        question: string;
        options: [string, string, string, string];
        correctAnswer: number;
        explanation: string;
    }> {
        if (!Array.isArray(input)) return [];

        const normalized = input
            .map((item) => {
                if (typeof item !== 'object' || item === null) return null;
                const q = item as {
                    question?: unknown;
                    options?: unknown;
                    correctAnswer?: unknown;
                    explanation?: unknown;
                };

                const question = String(q.question ?? '').trim();
                const explanation = String(q.explanation ?? '').trim();
                const options = Array.isArray(q.options)
                    ? q.options.map((opt) => String(opt ?? '').trim()).filter(Boolean)
                    : [];
                const correctAnswer = Number(q.correctAnswer);

                if (!question || !explanation || options.length !== 4) return null;
                if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) return null;

                return {
                    question,
                    options: [options[0], options[1], options[2], options[3]] as [string, string, string, string],
                    correctAnswer,
                    explanation,
                };
            })
            .filter((item): item is {
                question: string;
                options: [string, string, string, string];
                correctAnswer: number;
                explanation: string;
            } => item !== null);

        return normalized;
    }

    private async parseQuestionsWithRepair(rawContent: string) {
        const direct = this.tryParseQuestions(rawContent);
        if (direct.length > 0) return direct;

        const repairMessages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You repair malformed JSON for machine parsing.
Return ONLY a valid JSON array of objects with fields:
question (string), options (array of 4 strings), correctAnswer (0-3 integer), explanation (string).`,
            },
            {
                role: 'user',
                content: `Repair this content into valid JSON array only:\n\n${rawContent}`,
            },
        ];

        const repaired = await this.aiService.generateCompletion(
            repairMessages,
            undefined,
            { timeoutMs: 30_000, maxRetries: 0, maxTokens: 1_500, temperature: 0 },
        );

        const repairedQuestions = this.tryParseQuestions(repaired.content);
        if (repairedQuestions.length > 0) return repairedQuestions;

        throw new Error('AI output could not be parsed into valid MCQ JSON.');
    }

    private tryParseQuestions(rawContent: string) {
        const stripped = this.stripMarkdownFence(rawContent);
        const extracted = this.extractFirstJsonArray(stripped);

        try {
            const parsed = JSON.parse(extracted);
            return this.normalizeQuestions(parsed);
        } catch {
            return [];
        }
    }
}
