import { Injectable, Logger } from '@nestjs/common';

/**
 * McqService — MCQ business logic
 *
 * Responsibilities (Phase 2+):
 *  - Orchestrate AI question generation via AiModule
 *  - Persist questions with metadata (topic, difficulty, exam type)
 *  - Support CRUD operations on the question bank
 *  - Build randomized quiz sessions
 */
@Injectable()
export class McqService {
    private readonly logger = new Logger(McqService.name);

    async generate(_payload: unknown): Promise<unknown> {
        this.logger.log('generate() called — not yet implemented');
        // TODO (Phase 3): Call AiService to generate questions from PDF chunks
        return { message: 'MCQ generation — coming in Phase 3' };
    }

    async findAll(): Promise<unknown> {
        this.logger.log('findAll() called — not yet implemented');
        // TODO (Phase 2): Query MongoDB with pagination and filters
        return { message: 'MCQ list — coming in Phase 2' };
    }

    async findOne(_id: string): Promise<unknown> {
        this.logger.log(`findOne(${_id}) called — not yet implemented`);
        // TODO (Phase 2): Query MongoDB for single question
        return { message: 'MCQ detail — coming in Phase 2' };
    }
}
