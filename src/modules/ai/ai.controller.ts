import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

/**
 * AiController — THIN controller
 *
 * Exposes internal AI capabilities as HTTP endpoints (useful for
 * admin/debug purposes and direct AI feature access).
 *
 * In most cases, other modules (McqModule, EvaluationModule) will
 * inject AiService directly rather than routing through HTTP.
 */
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /api/v1/ai/complete
     * Direct text completion endpoint.
     * TODO (Phase 3): Add CompletionDto, rate limiting, admin guard
     */
    @Post('complete')
    async complete(@Body() body: unknown): Promise<unknown> {
        return this.aiService.complete(body);
    }

    /**
     * POST /api/v1/ai/embed
     * Generate text embeddings for semantic search.
     * TODO (Phase 3): Add EmbedDto
     */
    @Post('embed')
    async embed(@Body() body: unknown): Promise<unknown> {
        return this.aiService.embed(body);
    }
}
