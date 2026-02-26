import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

/**
 * EvaluationModule
 *
 * Owns answer evaluation and performance analytics:
 *  - Grade user answers against correct MCQ answers
 *  - AI-powered explanation generation per question
 *  - Performance tracking per topic/difficulty
 *  - Score reporting and leaderboard data
 *
 * Phase 1: Structure only.
 */
@Module({
    imports: [
        // TODO (Phase 2): MongooseModule for Attempt, Result schemas
        // TODO (Phase 3): AiModule (for AI answer explanations)
    ],
    controllers: [EvaluationController],
    providers: [EvaluationService],
    exports: [EvaluationService],
})
export class EvaluationModule { }
