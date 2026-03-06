import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { PdfChunk, PdfChunkDocument } from '../schemas/pdf-chunk.schema';

@Injectable()
export class PdfChunkRepository {
    constructor(
        @InjectModel(PdfChunk.name)
        private readonly chunkModel: Model<PdfChunkDocument>,
    ) { }

    /**
     * Bulk-insert all chunks for a PDF in a single operation.
     * Uses insertMany — efficient for 100s of chunks.
     */
    async createMany(
        chunks: {
            pdfId: string;
            content: string;
            pageNumber: number;
            chunkIndex: number;
            embedding?: number[];
        }[],
    ): Promise<PdfChunkDocument[]> {
        return this.chunkModel.insertMany(chunks) as unknown as PdfChunkDocument[];
    }

    /**
     * All chunks for a PDF in reading order.
     * Uses compound index { pdfId, pageNumber, chunkIndex }.
     */
    async findByPdfId(pdfId: string): Promise<PdfChunkDocument[]> {
        return this.chunkModel
            .find({ pdfId })
            .sort({ pageNumber: 1, chunkIndex: 1 })
            .exec();
    }

    /** Delete all chunks for a PDF (before re-processing or on deletion). */
    async deleteByPdfId(pdfId: string): Promise<number> {
        const result = await this.chunkModel
            .deleteMany({ pdfId })
            .exec();
        return result.deletedCount;
    }
}
