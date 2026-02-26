import { Injectable, Logger } from '@nestjs/common';

/**
 * AiService — AI abstraction layer
 *
 * This is the SINGLE point of contact for all AI operations in Willofire.
 * McqModule, EvaluationModule, and any future modules MUST inject this
 * service instead of calling AI SDKs directly.
 *
 * This design means:
 *  - AI provider can change without touching feature modules
 *  - Token usage and costs are tracked in one place
 *  - Rate limiting and retry logic is centralized here
 *
 * Phase 1: Method stubs only. Implementation in Phase 3.
 */
@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    /**
     * Generate a text completion (used for MCQ generation, explanations etc.)
     * TODO (Phase 3): Call OpenAI/Gemini Chat API with structured prompt templates
     */
    async complete(_payload: unknown): Promise<unknown> {
        this.logger.log('complete() called — not yet implemented');
        // TODO (Phase 3): Implement AI completion with retry, fallback, token tracking
        return { message: 'AI complete — coming in Phase 3' };
    }

    /**
     * Generate text embeddings for semantic search over PDF content.
     * TODO (Phase 3): Call OpenAI Embeddings API / Gemini Embedding API
     */
    async embed(_payload: unknown): Promise<unknown> {
        this.logger.log('embed() called — not yet implemented');
        // TODO (Phase 3): Implement embedding generation for vector search
        return { message: 'AI embed — coming in Phase 3' };
    }
}
