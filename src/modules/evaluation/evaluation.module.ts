import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import {
    AnswerSubmission,
    AnswerSubmissionSchema,
} from './schemas/answer-submission.schema';
import {
    EvaluationResult,
    EvaluationResultSchema,
} from './schemas/evaluation-result.schema';
import { AnswerSubmissionRepository } from './repositories/answer-submission.repository';
import { EvaluationResultRepository } from './repositories/evaluation-result.repository';

/**
 * EvaluationModule — Phase 3 update.
 *
 * Registers AnswerSubmission + EvaluationResult schemas.
 * Both repositories exported so Phase 5's AI evaluation pipeline
 * can write results without coupling to EvaluationService internals.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AnswerSubmission.name, schema: AnswerSubmissionSchema },
            { name: EvaluationResult.name, schema: EvaluationResultSchema },
        ]),
        // TODO (Phase 5): AiModule for AI-powered evaluation
    ],
    controllers: [EvaluationController],
    providers: [
        EvaluationService,
        AnswerSubmissionRepository,
        EvaluationResultRepository,
    ],
    exports: [
        EvaluationService,
        AnswerSubmissionRepository,
        EvaluationResultRepository,
    ],
})
export class EvaluationModule { }
