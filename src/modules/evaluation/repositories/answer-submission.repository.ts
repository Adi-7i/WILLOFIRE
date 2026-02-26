import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import {
    AnswerSubmission,
    AnswerSubmissionDocument,
    SubmissionType,
} from '../schemas/answer-submission.schema';

/** APPEND-ONLY — no update methods. Submissions are immutable. */
@Injectable()
export class AnswerSubmissionRepository {
    constructor(
        @InjectModel(AnswerSubmission.name)
        private readonly submissionModel: Model<AnswerSubmissionDocument>,
    ) { }

    async create(data: {
        userId: string;
        questionRef: string;
        type: SubmissionType;
        fileUrl?: string;
        textAnswer?: string;
    }): Promise<AnswerSubmissionDocument> {
        return this.submissionModel.create({
            ...data,
            fileUrl: data.fileUrl ?? null,
            textAnswer: data.textAnswer ?? null,
        });
    }

    async findById(id: string): Promise<AnswerSubmissionDocument | null> {
        return this.submissionModel.findById(id).exec();
    }

    async findByUserId(userId: string, limit = 20, skip = 0): Promise<AnswerSubmissionDocument[]> {
        return this.submissionModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
}
