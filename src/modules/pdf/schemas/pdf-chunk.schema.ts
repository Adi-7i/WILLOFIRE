import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PdfChunkDocument = HydratedDocument<PdfChunk>;

/**
 * PdfChunk schema — individual text segment extracted from a PDF page.
 *
 * Design:
 *  - `pdfId` stored as ObjectId (type) but typed as string (Mongoose auto-casts).
 *  - `chunkIndex` is position within the page; global order = (pageNumber, chunkIndex).
 *  - `embedding` is a sparse number[] placeholder for Phase 4 vector search.
 *    sparse: true — only chunks with embeddings consume index space.
 *  - No `updatedAt` — chunks are immutable; re-processing deletes + re-creates.
 *  - Compound index for deterministic re-assembly.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'pdf_chunks' })
export class PdfChunk extends Document {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Pdf',
        required: true,
        index: true,
    })
    pdfId!: string;

    /** Raw extracted text for this chunk. */
    @Prop({ required: true })
    content!: string;

    /** 1-based page number this chunk was extracted from. */
    @Prop({ required: true, type: Number })
    pageNumber!: number;

    /** 0-based position of this chunk within its page. */
    @Prop({ required: true, type: Number })
    chunkIndex!: number;

    /**
     * Vector embedding placeholder — populated in Phase 4 by the AI module.
     * sparse index: only chunks with embeddings consume index space.
     */
    @Prop({ type: [Number], sparse: true })
    embedding?: number[];
}

export const PdfChunkSchema = SchemaFactory.createForClass(PdfChunk);

/**
 * Compound index for deterministic chunk re-assembly:
 *   db.pdf_chunks.find({ pdfId }).sort({ pageNumber: 1, chunkIndex: 1 })
 */
PdfChunkSchema.index({ pdfId: 1, pageNumber: 1, chunkIndex: 1 });
