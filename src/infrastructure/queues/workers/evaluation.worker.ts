import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { ANSWER_EVALUATION_QUEUE } from '../queue.constants';
import { EvaluationPayload } from '../queue.service';

/**
 * EvaluationWorker
 *
 * Processes uploaded answer sheets, performs handwriting recognition / OCR
 * as needed, compares answers against generated rubrics via LLM, and
 * outputs final EvaluationResult to MongoDB.
 *
 * Phase 5: Infrastructure stub for async evaluation execution.
 */
@Injectable()
export class EvaluationWorker implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(EvaluationWorker.name);
    private worker!: Worker<EvaluationPayload, string, string>;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    onModuleInit() {
        this.logger.log(`Initializing worker for queue: ${ANSWER_EVALUATION_QUEUE}`);

        this.worker = new Worker(
            ANSWER_EVALUATION_QUEUE,
            async (job: Job<EvaluationPayload>) => {
                return this.processJob(job);
            },
            {
                connection: this.redis,
                concurrency: 3,
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
        this.logger.log(`Closing worker: ${ANSWER_EVALUATION_QUEUE}`);
        await this.worker?.close();
    }

    private async processJob(job: Job<EvaluationPayload>): Promise<string> {
        const { submissionId, userId } = job.data;
        this.logger.log(
            `[EvalWorker] Started evaluating AnswerSubmission ${submissionId} for User ${userId}`,
        );

        // Simulation for Phase 5
        await new Promise((resolve) => setTimeout(resolve, 4000));

        this.logger.log(`[EvalWorker] Finished evaluation for Submission ${submissionId}`);
        return `Evaluated submission ${submissionId}`;
    }
}
