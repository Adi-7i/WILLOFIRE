import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

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
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly aiService: AiService,
        private readonly pdfChunkRepository: PdfChunkRepository,
        private readonly mcqTestRepository: McqTestRepository,
    ) { }

    onModuleInit() {
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
            const contextString = selectedChunks.map(c => c.content).join('\n\n');

            // 3. Render prompt
            const userPrompt = MCQ_GENERATION_PROMPT.render({
                context: contextString,
                count: numQuestions,
                difficulty,
            });

            // 4. Generate completion
            const result = await this.aiService.generateCompletion([
                { role: 'system', content: MCQ_GENERATION_PROMPT.system },
                { role: 'user', content: userPrompt },
            ]);

            // 5. Clean up AI JSON wrapping (handling markdown code blocks if the AI hallucinates them despite instructions)
            let rawJson = result.content.trim();
            if (rawJson.startsWith('```json')) {
                rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (rawJson.startsWith('```')) {
                rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
            }

            // 6. Parse JSON array
            const questions = JSON.parse(rawJson);

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
}
