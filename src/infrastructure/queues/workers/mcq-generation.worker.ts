import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { MCQ_GENERATION_QUEUE } from '../queue.constants';
import { McqGenerationPayload } from '../queue.service';

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

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

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
            this.logger.error(`Job [${job?.id}] failed:`, err);
        });

        this.worker.on('error', (err) => {
            this.logger.error('Worker experienced a general error:', err);
        });
    }

    async onApplicationShutdown() {
        this.logger.log(`Closing worker: ${MCQ_GENERATION_QUEUE}`);
        await this.worker?.close();
    }

    private async processJob(job: Job<McqGenerationPayload>): Promise<string> {
        const { pdfId, userId, numQuestions } = job.data;
        this.logger.log(
            `[McqWorker] Start generating ${numQuestions} questions for PDF ${pdfId} | User ${userId}`,
        );

        // Simulation for Phase 5
        await new Promise((resolve) => setTimeout(resolve, 3500));

        this.logger.log(`[McqWorker] Finished generation for PDF ${pdfId}`);
        return `Generated MCQs for PDF ${pdfId}`;
    }
}
