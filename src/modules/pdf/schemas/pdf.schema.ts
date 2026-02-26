import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PdfDocument = HydratedDocument<Pdf>;

/**
 * PdfStatus — the processing lifecycle of an uploaded PDF.
 *
 * uploaded   → file received, not yet queued for parsing
 * processing → BullMQ worker is actively parsing pages
 * ready      → all chunks extracted; MCQ generation can proceed
 * failed     → processing error; error details stored in a separate log
 */
export enum PdfStatus {
    UPLOADED = 'uploaded',
    PROCESSING = 'processing',
    READY = 'ready',
    FAILED = 'failed',
}

/**
 * Pdf schema
 *
 * Design decisions:
 *  - `userId` is stored as an ObjectId (via MongooseSchema.Types.ObjectId type)
 *    but we use `ref: 'User'` to document the relationship.
 *    Repositories receive string IDs and cast to ObjectId internally.
 *  - `status` uses an enum — invalid state transitions caught at DB level.
 *  - `pageCount` is optional until processing completes.
 *  - `fileSizeBytes` enables quota enforcement without calling storage APIs.
 *  - Compound index `{ userId, createdAt }` makes paginated user list queries
 *    a covered index scan at any scale.
 */
@Schema({ timestamps: true, collection: 'pdfs' })
export class Pdf extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId!: string;

    /** Original filename from the upload — stored for display, not routing. */
    @Prop({ required: true, trim: true })
    originalName!: string;

    /** Full URL or storage path (S3 key, local path, etc.) */
    @Prop({ required: true })
    fileUrl!: string;

    @Prop({
        type: String,
        enum: Object.values(PdfStatus),
        default: PdfStatus.UPLOADED,
        index: true,
    })
    status!: PdfStatus;

    /** Set to null until processing succeeds. */
    @Prop({ type: Number, default: null })
    pageCount!: number | null;

    /** File size in bytes — for quota and display. */
    @Prop({ type: Number, required: true })
    fileSizeBytes!: number;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);

/**
 * Compound index for the most common query pattern:
 * "Get all PDFs for userId X, ordered by newest first, paginated."
 * Without this, every list request is a collection scan.
 */
PdfSchema.index({ userId: 1, createdAt: -1 });
