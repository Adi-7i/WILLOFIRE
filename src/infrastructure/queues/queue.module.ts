import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigModule } from '@nestjs/config';

import { RedisModule } from '../redis/redis.module';
import { REDIS_CLIENT } from '../redis/redis.constants';
import {
    PDF_PROCESSING_QUEUE,
    MCQ_GENERATION_QUEUE,
    ANSWER_EVALUATION_QUEUE,
} from './queue.constants';
import { PdfModule } from '../../modules/pdf/pdf.module';
import { QueueService } from './queue.service';

import { PdfProcessingWorker } from './workers/pdf-processing.worker';
import { McqGenerationWorker } from './workers/mcq-generation.worker';
import { EvaluationWorker } from './workers/evaluation.worker';

/**
 * QueueModule
 *
 * Encapsulates all BullMQ queues and workers.
 *
 * By making it @Global(), any feature module can inject `QueueService`
 * simply by declaring `@Inject(QueueService)` without needing to import
 * QueueModule directly.
 *
 * Workers are instantiated as providers here. They self-register with
 * BullMQ during `onModuleInit` inside their respective classes.
 */
@Global()
@Module({
    imports: [ConfigModule, RedisModule, PdfModule],
    providers: [
        // ── BullMQ Queue Providers ────────────────────────────────────────────────
        {
            provide: PDF_PROCESSING_QUEUE,
            useFactory: (redis) => new Queue(PDF_PROCESSING_QUEUE, { connection: redis }),
            inject: [REDIS_CLIENT],
        },
        {
            provide: MCQ_GENERATION_QUEUE,
            useFactory: (redis) => new Queue(MCQ_GENERATION_QUEUE, { connection: redis }),
            inject: [REDIS_CLIENT],
        },
        {
            provide: ANSWER_EVALUATION_QUEUE,
            useFactory: (redis) => new Queue(ANSWER_EVALUATION_QUEUE, { connection: redis }),
            inject: [REDIS_CLIENT],
        },

        // ── Services ─────────────────────────────────────────────────────────────
        QueueService,

        // ── Workers ──────────────────────────────────────────────────────────────
        PdfProcessingWorker,
        McqGenerationWorker,
        EvaluationWorker,
    ],
    exports: [QueueService], // We do NOT export RAW queues. Only the service API.
})
export class QueueModule { }
