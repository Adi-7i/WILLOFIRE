import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { extname } from 'path';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { AnswerSubmissionRepository } from './repositories/answer-submission.repository';
import { EvaluationResultRepository } from './repositories/evaluation-result.repository';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { STORAGE_TOKEN, StorageService } from '../../infrastructure/storage/storage.interface';
import { SubmissionType } from './schemas/answer-submission.schema';

/**
 * EvaluationService — Evaluation business logic
 *
 * Responsibilities (Phase 2+):
 *  - Grade user quiz attempts (compare against answer keys)
 *  - Compute per-topic scores and performance metrics
 *  - Trigger AI to generate explanations for wrong answers
 *  - Persist attempt records to MongoDB
 *  - Aggregate leaderboard/history data
 */
@Injectable()
export class EvaluationService {
    private readonly logger = new Logger(EvaluationService.name);

    constructor(
        private readonly answerSubmissionRepository: AnswerSubmissionRepository,
        private readonly evaluationResultRepository: EvaluationResultRepository,
        private readonly queueService: QueueService,
        @Inject(STORAGE_TOKEN) private readonly storageService: StorageService,
    ) { }

    async submit(dto: SubmitAnswerDto, file: Express.Multer.File, userId: string): Promise<any> {
        this.logger.log(`submit() called by User: ${userId} for Question: ${dto.questionRef}`);

        let type: SubmissionType;
        let fileUrl: string | null = null;
        let textAnswer: string | null = null;

        if (file) {
            // Determine type from file extension
            if (file.mimetype === 'application/pdf') {
                type = SubmissionType.PDF;
            } else if (file.mimetype.startsWith('image/')) {
                type = SubmissionType.IMAGE;
            } else {
                throw new BadRequestException('Unsupported file type');
            }

            // Upload the physical blob
            const ext = extname(file.originalname);
            const safeName = `${userId}-${Date.now()}${ext}`;
            const uploadResult = await this.storageService.uploadFile(file.buffer, safeName, file.mimetype, 'answers');
            fileUrl = uploadResult.publicUrl;
        } else {
            type = SubmissionType.TEXT;
            // Future-proofing: We expect a text answer field in the body if no file is present.
            // But Phase 9 primarily focuses on OCR files.
            textAnswer = "TEXT SUBMISSION PLACEHOLDER";
        }

        // 1. Create the immutable Submission record
        const submission = await this.answerSubmissionRepository.create({
            userId,
            questionRef: dto.questionRef,
            type,
            fileUrl: fileUrl ?? undefined,
            textAnswer: textAnswer ?? undefined,
        });

        // 2. Dispatch to the background worker to execute OCR + AI Grading
        await this.queueService.enqueueEvaluationJob({
            submissionId: submission._id.toString(),
            userId,
        });

        return {
            submissionId: submission._id,
            status: 'queued',
            message: 'Answer submission received and queued for AI evaluation.',
        };
    }

    async getResult(submissionId: string): Promise<any> {
        this.logger.log(`getResult(${submissionId}) called`);

        const result = await this.evaluationResultRepository.findLatestBySubmissionId(submissionId);
        if (!result) {
            throw new NotFoundException('Evaluation result not processing or not found');
        }

        return {
            score: result.score,
            maxScore: result.maxScore,
            strengths: result.strengths,
            improvements: result.improvements,
            version: result.version,
        };
    }

    async getHistory(): Promise<unknown> {
        this.logger.log('getHistory() called — not yet implemented');
        // TODO (Phase 2): Fetch paginated history for authenticated user
        return { message: 'Evaluation history — coming in Phase 2' };
    }
}
