import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AnswerSubmissionDocument = HydratedDocument<AnswerSubmission>;

/**
 * SubmissionType — medium the student used to submit their answer.
 */
export enum SubmissionType {
    PDF = 'pdf',
    IMAGE = 'image',
    TEXT = 'text',
}

/**
 * AnswerSubmission schema — IMMUTABLE, append-only.
 *
 * - `questionRef` is a flexible string to support MCQ + free-text questions.
 * - `fileUrl` / `textAnswer` are mutually optional — service layer enforces presence.
 * - NO `updatedAt`. Re-submission creates a new document.
 * - `userId` typed as string; Mongoose schema type is ObjectId.
 */
@Schema({
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'answer_submissions',
})
export class AnswerSubmission extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId!: string;

    /**
     * Flexible question reference.
     * Format: "<type>:<id>" e.g. "mcq:<objectId>" or "free:<questionString>"
     */
    @Prop({ required: true })
    questionRef!: string;

    /** Storage URL — present for pdf and image types. */
    @Prop({ type: String, default: null })
    fileUrl!: string | null;

    /** Raw typed text — present for text type. */
    @Prop({ type: String, default: null })
    textAnswer!: string | null;

    @Prop({
        type: String,
        enum: Object.values(SubmissionType),
        required: true,
    })
    type!: SubmissionType;
}

export const AnswerSubmissionSchema =
    SchemaFactory.createForClass(AnswerSubmission);
