import { Injectable, Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import {
    PDF_PROCESSING_QUEUE,
    MCQ_GENERATION_QUEUE,
    ANSWER_EVALUATION_QUEUE,
} from './queue.constants';

/**
 * Job Parameter Interfaces
 *
 * Enforces strict typing for background jobs. Feature modules pass
 * these shapes instead of 'any' to ensure workers get what they expect.
 */

// Phase 6
export interface PdfProcessingPayload {
    pdfId: string;
    userId: string;
    fileKey: string; // the string used to fetch from StorageService
}

// Phase 6
export interface McqGenerationPayload {
    pdfId: string;
    userId: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

// Phase 7
export interface EvaluationPayload {
    submissionId: string;
    userId: string;
}

/**
 * QueueService
 *
 * The strict public API for enqueuing async work.
 * Controllers and Services MUST use these methods; they should never inject
 * the BullMQ raw queues (which are internal strictly to this module).
 */
@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    // Common job options:
    // 3 attempts, exponential backoff starting at 2 seconds.
    private readonly defaultJobOptions = {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true, // Keep redis memory footprint low
    };

    /**
     * We inject the raw BullMQ Queue instances here via custom tokens.
     */
    constructor(
        @Inject(PDF_PROCESSING_QUEUE) private readonly pdfQueue: Queue<PdfProcessingPayload>,
        @Inject(MCQ_GENERATION_QUEUE) private readonly mcqQueue: Queue<McqGenerationPayload>,
        @Inject(ANSWER_EVALUATION_QUEUE) private readonly evalQueue: Queue<EvaluationPayload>,
    ) { }

    /**
     * Queue a PDF for text extraction and chunking.
     */
    async enqueuePdfProcessingJob(payload: PdfProcessingPayload): Promise<string> {
        const jobName = `process-pdf-${payload.pdfId}`;
        const job = await this.pdfQueue.add(jobName, payload, this.defaultJobOptions);
        this.logger.debug(`Enqueued [${jobName}] (Job ID: ${job.id})`);
        return job.id!;
    }

    /**
     * Queue MCQ generation logic across chunks for a given PDF.
     */
    async enqueueMcqGenerationJob(payload: McqGenerationPayload): Promise<string> {
        const jobName = `generate-mcq-${payload.pdfId}`;
        const job = await this.mcqQueue.add(jobName, payload, this.defaultJobOptions);
        this.logger.debug(`Enqueued [${jobName}] (Job ID: ${job.id})`);
        return job.id!;
    }

    /**
     * Queue answer evaluation (image/pdf -> text logic, followed by LLM scoring).
     */
    async enqueueEvaluationJob(payload: EvaluationPayload): Promise<string> {
        const jobName = `evaluate-${payload.submissionId}`;
        const job = await this.evalQueue.add(jobName, payload, this.defaultJobOptions);
        this.logger.debug(`Enqueued [${jobName}] (Job ID: ${job.id})`);
        return job.id!;
    }
}
