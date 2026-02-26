import { Injectable, Logger } from '@nestjs/common';

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

    async submit(_payload: unknown): Promise<unknown> {
        this.logger.log('submit() called — not yet implemented');
        // TODO (Phase 2): Grade answers, persist attempt, return scored result
        return { message: 'Evaluation submit — coming in Phase 2' };
    }

    async getResult(_attemptId: string): Promise<unknown> {
        this.logger.log(`getResult(${_attemptId}) called — not yet implemented`);
        // TODO (Phase 2): Fetch attempt result from MongoDB
        return { message: 'Evaluation result — coming in Phase 2' };
    }

    async getHistory(): Promise<unknown> {
        this.logger.log('getHistory() called — not yet implemented');
        // TODO (Phase 2): Fetch paginated history for authenticated user
        return { message: 'Evaluation history — coming in Phase 2' };
    }
}
