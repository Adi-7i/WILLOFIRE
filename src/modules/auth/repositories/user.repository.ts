import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';

/**
 * UserRepository
 *
 * The ONLY place that calls Model<User> methods directly.
 *
 * Design rules:
 *  1. No business logic — just DB operations.
 *  2. All methods return typed documents or null — never throw DB errors
 *     directly (callers handle that).
 *  3. `userId` is always a string at the service layer; we convert
 *     to ObjectId internally via Mongoose's automatic casting.
 */
@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    /** Find one user by their MongoDB `_id`. */
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    /** Find one user by email (lowercase — stored that way in schema). */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ email: email.toLowerCase() })
            .exec();
    }

    /** Persist a new user. Caller must supply the hashed password. */
    async create(data: {
        email: string;
        passwordHash: string;
    }): Promise<UserDocument> {
        return this.userModel.create(data);
    }

    /**
     * Partial update — only the fields in `data` are written.
     * Returns the updated document (new: true) or null if not found.
     */
    async updateById(
        id: string,
        data: mongoose.UpdateQuery<User>,
    ): Promise<UserDocument | null> {
        return this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    /**
     * Invalidate the refresh token by setting its hash to null.
     * Called on logout and on token reuse detection.
     */
    async nullifyRefreshToken(id: string): Promise<void> {
        await this.userModel
            .findByIdAndUpdate(id, { refreshTokenHash: null })
            .exec();
    }
}
