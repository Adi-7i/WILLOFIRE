import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { McqTest, McqTestDocument, McqQuestion } from '../schemas/mcq-test.schema';

@Injectable()
export class McqTestRepository {
    constructor(
        @InjectModel(McqTest.name)
        private readonly testModel: Model<McqTestDocument>,
    ) { }

    async create(data: {
        userId: string;
        pdfId: string;
        title: string;
        questions: McqQuestion[];
        totalQuestions: number;
    }): Promise<McqTestDocument> {
        return this.testModel.create(data);
    }

    async findById(id: string): Promise<McqTestDocument | null> {
        return this.testModel.findById(id).exec();
    }

    /** Uses index { userId: 1, createdAt: -1 }. */
    async findByUserId(
        userId: string,
        limit = 20,
        skip = 0,
    ): Promise<McqTestDocument[]> {
        return this.testModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    /** Uses index { pdfId: 1, createdAt: -1 }. */
    async findByPdfId(pdfId: string): Promise<McqTestDocument[]> {
        return this.testModel
            .find({ pdfId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async deleteById(id: string): Promise<void> {
        await this.testModel.findByIdAndDelete(id).exec();
    }
}
