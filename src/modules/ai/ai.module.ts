import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PdfModule } from '../pdf/pdf.module';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module';
import { ConfigModule } from '@nestjs/config';

/**
 * AiModule
 *
 * Central AI abstraction layer — isolates all AI provider logic here.
 * No other module should call OpenAI/Gemini APIs directly; they must
 * go through AiService. This means swapping AI providers later requires
 * changing only this module.
 *
 * Responsibilities (Phase 3+):
 *  - Text completion / chat calls
 *  - Embedding generation for semantic search
 *  - Prompt template management
 *  - AI provider failover/fallback
 *  - Token usage logging & cost tracking
 *
 * Phase 1: Structure only.
 */
@Module({
    imports: [
        ConfigModule,
        PdfModule,
        PdfGeneratorModule,
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService], // Exported — McqModule & EvaluationModule will consume it
})
export class AiModule { }
