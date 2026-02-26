import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { McqService } from './mcq.service';

/**
 * McqController — THIN controller
 * Delegates all MCQ business logic to McqService.
 */
@Controller('mcq')
export class McqController {
    constructor(private readonly mcqService: McqService) { }

    /**
     * POST /api/v1/mcq/generate
     * Trigger AI generation of questions from a PDF.
     * TODO (Phase 3): Accept GenerateMcqDto with pdfId + options
     */
    @Post('generate')
    async generate(@Body() body: unknown): Promise<unknown> {
        return this.mcqService.generate(body);
    }

    /**
     * GET /api/v1/mcq
     * List all questions (with filters via query params).
     * TODO (Phase 2): Add pagination, filtering DTOs
     */
    @Get()
    async findAll(): Promise<unknown> {
        return this.mcqService.findAll();
    }

    /**
     * GET /api/v1/mcq/:id
     * Get a single question by ID.
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<unknown> {
        return this.mcqService.findOne(id);
    }
}
