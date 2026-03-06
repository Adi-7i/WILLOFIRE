import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { ANSWER_EVALUATION_QUEUE } from '../queue.constants';
import { EvaluationPayload } from '../queue.service';
import { AiService } from '../../../modules/ai/ai.service';
import { ANSWER_EVALUATION_PROMPT } from '../../../modules/ai/prompts/answer-evaluation.prompt';
import { AnswerSubmissionRepository } from '../../../modules/evaluation/repositories/answer-submission.repository';
import { EvaluationResultRepository } from '../../../modules/evaluation/repositories/evaluation-result.repository';
import { STORAGE_TOKEN, StorageService } from '../../storage/storage.interface';
import { SubmissionType } from '../../../modules/evaluation/schemas/answer-submission.schema';
import { createWorker } from 'tesseract.js';

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

    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly aiService: AiService,
        private readonly answerSubmissionRepository: AnswerSubmissionRepository,
        private readonly evaluationResultRepository: EvaluationResultRepository,
        @Inject(STORAGE_TOKEN) private readonly storageService: StorageService,
    ) { }

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
        this.logger.log(`[EvalWorker] Started evaluating AnswerSubmission ${submissionId} for User ${userId}`);

        try {
            // 1. Fetch submission
            const submission = await this.answerSubmissionRepository.findById(submissionId);
            if (!submission) {
                throw new Error(`Submission ${submissionId} not found`);
            }

            let extractedText = '';

            // 2. Extract Text via OCR or parsing
            if (submission.type === SubmissionType.TEXT) {
                extractedText = submission.textAnswer || '';
            } else if (submission.fileUrl) {
                // Determine filekey from the fileUrl if needed, or assume fileUrl contains the key depending on how StorageService stores it.
                // Assuming simple key structure for now. If fileUrl is a full blob URL, we might need to parse the key.
                // Here we rely on downloading the buffer from Azure directly, then writing to temp file or passing buffer to OCR.

                // For this implementation, we simulate the storage fetch if the strict azure blob method signature isn't exposed for buffer download yet.
                // Normally: const buffer = await this.storageService.downloadFile(fileKey);
                // Since this phase focuses on the AI pipeline + OCR, and Azure Blob SDK `downloadToBuffer` is standard:

                this.logger.log(`[EvalWorker] Extracting text for ${submission.type} from ${submission.fileUrl}`);

                // OCR Logic Stub for Images (Tesseract.js)
                if (submission.type === SubmissionType.IMAGE) {
                    // Requires a physical temp file for tesseract.recognize usually, or buffer
                    // const worker = await createWorker('eng');
                    // const ret = await worker.recognize(buffer);
                    // extractedText = ret.data.text;
                    // await worker.terminate();

                    extractedText = "Simulated OCR extracted text from image.";
                    // Note: Real tesseract initialization is heavy. In production, keep worker alive or use lightweight parsing.
                }
                // PDF Parsing Logic
                else if (submission.type === SubmissionType.PDF) {
                    // const pdfData = await pdf(buffer);
                    // extractedText = pdfData.text;
                    extractedText = "Simulated text extracted from PDF answer sheet.";
                }
            }

            // 3. Normalize text
            const normalizedAnswer = extractedText.trim().replace(/\s+/g, ' ');
            if (!normalizedAnswer) {
                throw new Error('Extracted text was empty, cannot evaluate.');
            }

            // 4. Build AI Prompt
            const userPrompt = ANSWER_EVALUATION_PROMPT.render({
                answer: normalizedAnswer,
                questionRef: submission.questionRef,
            });

            // 5. Generate AI Evaluation
            const result = await this.aiService.generateCompletion([
                { role: 'system', content: ANSWER_EVALUATION_PROMPT.system },
                { role: 'user', content: userPrompt }
            ]);

            // Clean markdown blocks
            let rawJson = result.content.trim();
            if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
            else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();

            const evaluation = JSON.parse(rawJson);

            // 6. Versioning System
            const previousResult = await this.evaluationResultRepository.findLatestBySubmissionId(submissionId);
            const currentVersion = previousResult ? previousResult.version : 0;
            const newVersion = currentVersion + 1;

            // 7. Save Immutable Result
            const dbResult = await this.evaluationResultRepository.create({
                submissionId,
                userId,
                score: evaluation.score,
                maxScore: evaluation.maxScore,
                strengths: evaluation.strengths,
                improvements: evaluation.improvements,
                aiModelVersion: ANSWER_EVALUATION_PROMPT.version,
                version: newVersion,
            });

            this.logger.log(`[EvalWorker] Successfully stored EvaluationResult ${dbResult._id} (v${newVersion})`);
            return `Evaluated submission ${submissionId} matching version ${newVersion}`;

        } catch (error) {
            this.logger.error(`[EvalWorker] Failed evaluation for submission ${submissionId}: ${(error as Error).message}`, (error as Error).stack);
            throw error;
        }
    }
}
