import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EvaluationResultDocument = HydratedDocument<EvaluationResult>;

/**
 * EvaluationResult schema — IMMUTABLE, append-only.
 *
 * - NO `updatedAt`. Re-evaluation creates a new document with version+1.
 * - `version` starts at 1. Latest = sort({ version: -1 }).limit(1).
 * - `aiModelVersion` tracks which AI model produced the result.
 * - `maxScore` stored (not hardcoded) for variable-weight questions in V2.
 * - `submissionId`/`userId` typed as string; Mongoose schema type is ObjectId.
 * - Compound index `{ submissionId, version }` for efficient latest-version fetch.
 */
@Schema({
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'evaluation_results',
})
export class EvaluationResult extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'AnswerSubmission',
        required: true,
        index: true,
    })
    submissionId!: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId!: string;

    /** Raw score achieved. */
    @Prop({ required: true, type: Number, min: 0 })
    score!: number;

    /** Maximum achievable score for this question. */
    @Prop({ required: true, type: Number, min: 0 })
    maxScore!: number;

    /** Positive aspects identified by the evaluator. */
    @Prop({ type: [String], default: [] })
    strengths!: string[];

    /** Areas for improvement identified by the evaluator. */
    @Prop({ type: [String], default: [] })
    improvements!: string[];

    /** Which AI model / prompt version produced this result. */
    @Prop({ required: true })
    aiModelVersion!: string;

    /**
     * Evaluation version starting at 1.
     * Incremented on re-evaluation — old versions preserved for audit.
     */
    @Prop({ required: true, type: Number, min: 1, default: 1 })
    version!: number;
}

export const EvaluationResultSchema =
    SchemaFactory.createForClass(EvaluationResult);

/** Primary: "all evaluations for submission X, newest version first" */
EvaluationResultSchema.index({ submissionId: 1, version: -1 });
