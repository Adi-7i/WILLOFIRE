import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { McqAttempt, McqAttemptDocument, McqAnswer } from '../schemas/mcq-attempt.schema';

/** APPEND-ONLY — no update methods. Attempts are immutable records. */
@Injectable()
export class McqAttemptRepository {
    constructor(
        @InjectModel(McqAttempt.name)
        private readonly attemptModel: Model<McqAttemptDocument>,
    ) { }

    async create(data: {
        testId: string;
        userId: string;
        answers: McqAnswer[];
        score: number;
        timeTakenSeconds?: number;
    }): Promise<McqAttemptDocument> {
        return this.attemptModel.create(data);
    }

    async findById(id: string): Promise<McqAttemptDocument | null> {
        return this.attemptModel.findById(id).exec();
    }

    async findByTestId(testId: string): Promise<McqAttemptDocument[]> {
        return this.attemptModel
            .find({ testId })
            .sort({ submittedAt: -1 })
            .exec();
    }

    async findByUserId(userId: string, limit = 20, skip = 0): Promise<McqAttemptDocument[]> {
        return this.attemptModel
            .find({ userId })
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    /**
     * Uses compound index { testId: 1, userId: 1 }.
     * Returns array to support multiple re-takes (caller picks which to use).
     */
    async findByTestAndUser(testId: string, userId: string): Promise<McqAttemptDocument[]> {
        return this.attemptModel
            .find({
                testId,
                userId,
            })
            .sort({ submittedAt: -1 })
            .exec();
    }
}
