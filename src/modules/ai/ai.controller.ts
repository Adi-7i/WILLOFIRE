import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { PdfQaDto } from './dto/pdf-qa.dto';

/**
 * AiController
 *
 * Exposes AI product features as HTTP endpoints.
 * Note: We do NOT expose raw 'complete' or 'embed' functions here
 * to prevent abuse. Each endpoint represents a specific product feature.
 */
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /api/v1/ai/pdf-qa
     * 
     * Asks a question against the context of a specific uploaded PDF.
     * Extracts relevant chunks, executes a versioned prompt, and returns the answer.
     */
    @Post('pdf-qa')
    async answerFromPdf(@Body() body: PdfQaDto) {
        return this.aiService.answerFromPdf(body);
    }
}
