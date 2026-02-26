import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { Pdf, PdfDocument, PdfStatus } from '../schemas/pdf.schema';

@Injectable()
export class PdfRepository {
    constructor(
        @InjectModel(Pdf.name)
        private readonly pdfModel: Model<PdfDocument>,
    ) { }

    async create(data: {
        userId: string;
        originalName: string;
        fileUrl: string;
        fileSizeBytes: number;
        status?: PdfStatus;
    }): Promise<PdfDocument> {
        return this.pdfModel.create(data);
    }

    async findById(id: string): Promise<PdfDocument | null> {
        return this.pdfModel.findById(id).exec();
    }

    /**
     * Paginated list, newest first.
     * Uses compound index { userId, createdAt }.
     */
    async findByUserId(
        userId: string,
        limit = 20,
        skip = 0,
    ): Promise<PdfDocument[]> {
        return this.pdfModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    /** Update status (+ optional pageCount). Called by the PDF processor worker. */
    async updateStatus(
        id: string,
        status: PdfStatus,
        pageCount?: number,
    ): Promise<PdfDocument | null> {
        const update: mongoose.UpdateQuery<Pdf> = { status };
        if (pageCount !== undefined) update.pageCount = pageCount;
        return this.pdfModel.findByIdAndUpdate(id, update, { new: true }).exec();
    }

    async updateById(
        id: string,
        data: mongoose.UpdateQuery<Pdf>,
    ): Promise<PdfDocument | null> {
        return this.pdfModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async deleteById(id: string): Promise<void> {
        await this.pdfModel.findByIdAndDelete(id).exec();
    }
}
