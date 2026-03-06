import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GenerateMcqDto } from './dto/generate-mcq.dto';
import { PdfRepository } from '../pdf/repositories/pdf.repository';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { McqTestRepository } from './repositories/mcq-test.repository';
import { McqAttemptRepository } from './repositories/mcq-attempt.repository';
import { SubmitMcqDto } from './dto/submit-mcq.dto';

/**
 * McqService — MCQ business logic
 *
 * Responsibilities (Phase 2+):
 *  - Orchestrate AI question generation via AiModule
 *  - Persist questions with metadata (topic, difficulty, exam type)
 *  - Support CRUD operations on the question bank
 *  - Build randomized quiz sessions
 */
@Injectable()
export class McqService {
    private readonly logger = new Logger(McqService.name);

    constructor(
        private readonly pdfRepository: PdfRepository,
        private readonly queueService: QueueService,
        private readonly mcqTestRepository: McqTestRepository,
        private readonly mcqAttemptRepository: McqAttemptRepository,
    ) { }

    async generate(dto: GenerateMcqDto, userId: string): Promise<any> {
        this.logger.log(`generate() called by User: ${userId} for PDF: ${dto.pdfId}`);

        // 1. Validate PDF exists and belongs to user
        const pdf = await this.pdfRepository.findById(dto.pdfId);
        if (!pdf || pdf.userId.toString() !== userId) {
            throw new NotFoundException('PDF not found or access denied');
        }

        // 2. Enqueue the async generation job
        await this.queueService.enqueueMcqGenerationJob({
            pdfId: dto.pdfId,
            userId,
            numQuestions: dto.count,
            difficulty: dto.difficulty,
        });

        return {
            status: 'queued',
            message: 'MCQ generation has been queued.',
        };
    }

    async findAll(userId: string): Promise<any> {
        this.logger.log(`findAll() called for User: ${userId}`);
        return this.mcqTestRepository.findByUserId(userId);
    }

    async findOne(id: string, userId: string): Promise<any> {
        this.logger.log(`findOne(${id}) called by User: ${userId}`);
        const test = await this.mcqTestRepository.findById(id);

        if (!test || test.userId.toString() !== userId) {
            throw new NotFoundException('MCQ test not found or access denied');
        }

        return test;
    }

    async submit(testId: string, dto: SubmitMcqDto, userId: string): Promise<any> {
        this.logger.log(`submit() called by User: ${userId} for Test: ${testId}`);

        // 1. Fetch test and validate ownership
        const test = await this.mcqTestRepository.findById(testId);
        if (!test || test.userId.toString() !== userId) {
            throw new NotFoundException('MCQ test not found or access denied');
        }

        let correct = 0;
        let incorrect = 0;
        const totalQuestions = test.totalQuestions;
        const results = [];

        // 2. Deterministic scoring
        for (const answer of dto.answers) {
            const question = test.questions[answer.questionIndex];
            if (!question) continue; // Out of bounds safety

            const isCorrect = answer.selectedOption === question.correctAnswer;

            if (isCorrect) correct++;
            else if (answer.selectedOption !== -1) incorrect++; // -1 is skipped, neither correct nor incorrect

            results.push({
                question: question.question,
                selectedOption: answer.selectedOption,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                isCorrect,
            });
        }

        const score = (correct / totalQuestions) * 100;
        const roundedScore = Math.round(score * 10) / 10;

        // 3. Save immutable attempt
        const attempt = await this.mcqAttemptRepository.create({
            testId,
            userId,
            answers: dto.answers,
            score: roundedScore,
        });

        // 4. Return breakdown
        return {
            attemptId: attempt._id,
            totalQuestions,
            score: roundedScore,
            correct,
            incorrect,
            results,
        };
    }
}
