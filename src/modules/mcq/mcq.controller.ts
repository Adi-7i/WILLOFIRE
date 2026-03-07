import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { McqService } from './mcq.service';
import { GenerateMcqDto } from './dto/generate-mcq.dto';
import { SubmitMcqDto } from './dto/submit-mcq.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * McqController — THIN controller
 * Delegates all MCQ business logic to McqService.
 */
@Controller('mcq')
export class McqController {
    constructor(private readonly mcqService: McqService) { }

    /**
     * POST /api/v1/mcq/generate
     * Trigger async AI generation of questions from a PDF.
     */
    @Post('generate')
    async generate(
        @Body() body: GenerateMcqDto,
        @CurrentUser() user: any,
    ) {
        return this.mcqService.generate(body, user.userId);
    }

    /**
     * GET /api/v1/mcq
     * List all questions (with filters via query params).
     */
    @Get()
    async findAll(@CurrentUser() user: any) {
        return this.mcqService.findAll(user.userId);
    }

    /**
     * GET /api/v1/mcq/:id
     * Get a single test by ID.
     */
    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.mcqService.findOne(id, user.userId);
    }

    /**
     * POST /api/v1/mcq/:testId/submit
     * Grade a user's test attempt and record the results to DB immutably.
     */
    @Post(':testId/submit')
    async submit(
        @Param('testId') testId: string,
        @Body() body: SubmitMcqDto,
        @CurrentUser() user: any,
    ) {
        return this.mcqService.submit(testId, body, user.userId);
    }

    /**
     * GET /api/v1/mcq/:testId/download
     * Downloads an offline-ready PDF containing the full test rubric structure.
     */
    @Get(':testId/download')
    async download(
        @Param('testId') testId: string,
        @CurrentUser() user: any,
    ) {
        return this.mcqService.downloadTestPdf(testId, user.userId);
    }

    /**
     * GET /api/v1/mcq/:testId/download-answer-key
     * Downloads an offline-ready Answer Key with correct hints and rationale formatting.
     */
    @Get(':testId/download-answer-key')
    async downloadAnswerKey(
        @Param('testId') testId: string,
        @CurrentUser() user: any,
    ) {
        return this.mcqService.downloadAnswerKeyPdf(testId, user.userId);
    }
}
