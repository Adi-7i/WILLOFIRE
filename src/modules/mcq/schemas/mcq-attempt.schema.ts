import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type McqAttemptDocument = HydratedDocument<McqAttempt>;

/**
 * McqAnswer — embedded subdocument representing a single answer.
 *
 * `questionIndex` maps back to McqTest.questions[n].
 * -1 for `selectedOption` means "skipped" — allows partial submissions.
 */
@Schema({ _id: false })
export class McqAnswer {
    /** 0-based index into the parent McqTest.questions array. */
    @Prop({ required: true, type: Number, min: 0 })
    questionIndex!: number;

    /** Selected option (0=A, 1=B, 2=C, 3=D). -1 = skipped. */
    @Prop({ required: true, type: Number, min: -1, max: 3 })
    selectedOption!: number;
}

export const McqAnswerSchema = SchemaFactory.createForClass(McqAnswer);

/**
 * McqAttempt schema — IMMUTABLE, append-only.
 *
 * - NO `updatedAt`. Once submitted, an attempt is never modified.
 *   Re-takes create new documents.
 * - `submittedAt` uses `createdAt` alias for semantic clarity.
 * - `score` is pre-calculated percentage (0-100).
 * - Compound index `{ testId, userId }` for "has user attempted test?" lookup.
 * - `userId`/`testId` typed as string; Mongoose schema type is ObjectId.
 */
@Schema({
    timestamps: { createdAt: 'submittedAt', updatedAt: false },
    collection: 'mcq_attempts',
})
export class McqAttempt extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'McqTest',
        required: true,
        index: true,
    })
    testId!: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId!: string;

    @Prop({ type: [McqAnswerSchema], required: true })
    answers!: McqAnswer[];

    /** Pre-calculated percentage (0–100). */
    @Prop({ required: true, type: Number, min: 0, max: 100 })
    score!: number;

    /** How long the user spent on the attempt. Optional for now. */
    @Prop({ type: Number, default: null })
    timeTakenSeconds!: number | null;

    /** Auto-set. Aliased from createdAt by timestamps config. */
    submittedAt!: Date;
}

export const McqAttemptSchema = SchemaFactory.createForClass(McqAttempt);

/** Primary lookup: "did user X attempt test Y?" */
McqAttemptSchema.index({ testId: 1, userId: 1 });
