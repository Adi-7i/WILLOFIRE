import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import {
    EvaluationResult,
    EvaluationResultDocument,
} from '../schemas/evaluation-result.schema';

/**
 * APPEND-ONLY — no update methods. Version history preserved by design.
 *
 * Re-evaluation flow:
 *  1. findLatestBySubmissionId → get current version
 *  2. create with version + 1
 */
@Injectable()
export class EvaluationResultRepository {
    constructor(
        @InjectModel(EvaluationResult.name)
        private readonly resultModel: Model<EvaluationResultDocument>,
    ) { }

    async create(data: {
        submissionId: string;
        userId: string;
        score: number;
        maxScore: number;
        strengths: string[];
        improvements: string[];
        aiModelVersion: string;
        version: number;
    }): Promise<EvaluationResultDocument> {
        return this.resultModel.create(data);
    }

    async findById(id: string): Promise<EvaluationResultDocument | null> {
        return this.resultModel.findById(id).exec();
    }

    /** All evaluations for a submission, newest version first. Uses compound index. */
    async findBySubmissionId(submissionId: string): Promise<EvaluationResultDocument[]> {
        return this.resultModel
            .find({ submissionId })
            .sort({ version: -1 })
            .exec();
    }

    /** Latest evaluation only — single document read via compound index. */
    async findLatestBySubmissionId(submissionId: string): Promise<EvaluationResultDocument | null> {
        return this.resultModel
            .findOne({ submissionId })
            .sort({ version: -1 })
            .exec();
    }

    async findByUserId(userId: string, limit = 20, skip = 0): Promise<EvaluationResultDocument[]> {
        return this.resultModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
}
