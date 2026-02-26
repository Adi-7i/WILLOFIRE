import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type McqTestDocument = HydratedDocument<McqTest>;

/**
 * McqQuestion — embedded subdocument (NOT a separate collection).
 *
 * Embedding questions inside the test document makes fetching a test
 * and all its questions a single document read — no joins, no round-trips.
 *
 * - `options` always has exactly 4 entries (A, B, C, D).
 * - `correctAnswer` is a 0-based index into `options` (0=A, 1=B, 2=C, 3=D).
 *   Storing an index prevents drift if options order is ever changed.
 * - `explanation` is the AI-generated rationale, shown after submission.
 */
@Schema({ _id: false })
export class McqQuestion {
    @Prop({ required: true })
    question!: string;

    @Prop({ type: [String], required: true })
    options!: string[];

    /** 0-based index into options[]. */
    @Prop({ required: true, type: Number, min: 0, max: 3 })
    correctAnswer!: number;

    @Prop({ required: true })
    explanation!: string;
}

export const McqQuestionSchema = SchemaFactory.createForClass(McqQuestion);

/**
 * McqTest schema
 *
 * - `userId`/`pdfId` stored as ObjectId type, typed as string (Mongoose auto-casts).
 * - `totalQuestions` is denormalized from questions.length for fast count queries.
 * - timestamps: true — tests can be updated (e.g. questions curated/corrected).
 */
@Schema({ timestamps: true, collection: 'mcq_tests' })
export class McqTest extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId!: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Pdf',
        required: true,
        index: true,
    })
    pdfId!: string;

    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ type: [McqQuestionSchema], required: true })
    questions!: McqQuestion[];

    /** Denormalized: avoids loading questions[] just for count. */
    @Prop({ required: true, type: Number, min: 1 })
    totalQuestions!: number;
}

export const McqTestSchema = SchemaFactory.createForClass(McqTest);

/** Covers: "list all tests for user X, newest first" */
McqTestSchema.index({ userId: 1, createdAt: -1 });

/** Covers: "find all tests generated from PDF Y" */
McqTestSchema.index({ pdfId: 1, createdAt: -1 });
