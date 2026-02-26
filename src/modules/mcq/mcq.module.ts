import { Module } from '@nestjs/common';
import { McqController } from './mcq.controller';
import { McqService } from './mcq.service';

/**
 * McqModule
 *
 * Owns MCQ (Multiple Choice Question) management:
 *  - AI-generated question bank from PDF content
 *  - Question CRUD (create, update, approve, archive)
 *  - Tagging by topic/difficulty/exam type
 *  - Quiz session creation
 *
 * Phase 1: Structure only.
 */
@Module({
    imports: [
        // TODO (Phase 2): MongooseModule for Question schema
        // TODO (Phase 3): AiModule (for AI-powered question generation)
    ],
    controllers: [McqController],
    providers: [McqService],
    exports: [McqService],
})
export class McqModule { }
