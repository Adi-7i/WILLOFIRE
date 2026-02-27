import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { PDF_PROCESSING_QUEUE } from '../queue.constants';
import { PdfProcessingPayload } from '../queue.service';

/**
 * PdfProcessingWorker
 *
 * Background worker responsible for downloading a PDF from Blob Storage,
 * extracting text, chunking it, creating embeddings, and saving to MongoDB.
 *
 * Phase 5: Instantiates the BullMQ Worker and logs job receipts to verify
 * background infrastructure is working. Business logic comes later.
 */
@Injectable()
export class PdfProcessingWorker implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(PdfProcessingWorker.name);
    private worker!: Worker<PdfProcessingPayload, string, string>;

    // Inject the shared Redis connection token
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    onModuleInit() {
        this.logger.log(`Initializing worker for queue: ${PDF_PROCESSING_QUEUE}`);

        this.worker = new Worker(
            PDF_PROCESSING_QUEUE,
            async (job: Job<PdfProcessingPayload>) => {
                return this.processJob(job);
            },
            {
                connection: this.redis,
                concurrency: 2, // Process up to 2 PDFs concurrently per container
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
        this.logger.log(`Closing worker: ${PDF_PROCESSING_QUEUE}`);
        await this.worker?.close();
    }

    /**
     * The actual processing logic isolated from BullMQ boilerplate.
     */
    private async processJob(job: Job<PdfProcessingPayload>): Promise<string> {
        const { pdfId, fileKey, userId } = job.data;
        this.logger.log(`[PdfWorker] Started processing PDF ${pdfId} for User ${userId}`);
        this.logger.debug(`[PdfWorker] Target file key: ${fileKey}`);

        // Simulation for Phase 5
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this.logger.log(`[PdfWorker] Finished processing PDF ${pdfId}`);
        return `Processed PDF ${pdfId} successfully`;
    }
}
