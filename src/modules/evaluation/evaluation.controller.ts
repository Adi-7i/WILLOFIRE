import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';

/**
 * EvaluationController — THIN controller
 * Delegates all evaluation logic to EvaluationService.
 */
@Controller('evaluation')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    /**
     * POST /api/v1/evaluation/submit
     * Submit user answers and receive graded results.
     * TODO (Phase 2): Accept SubmitAnswersDto
     */
    @Post('submit')
    async submit(@Body() body: unknown): Promise<unknown> {
        return this.evaluationService.submit(body);
    }

    /**
     * GET /api/v1/evaluation/results/:attemptId
     * Get the full result report for a quiz attempt.
     */
    @Get('results/:attemptId')
    async getResult(@Param('attemptId') attemptId: string): Promise<unknown> {
        return this.evaluationService.getResult(attemptId);
    }

    /**
     * GET /api/v1/evaluation/history
     * Get the authenticated user's full attempt history.
     * TODO (Phase 2): Requires JwtAuthGuard + CurrentUser decorator
     */
    @Get('history')
    async getHistory(): Promise<unknown> {
        return this.evaluationService.getHistory();
    }
}
