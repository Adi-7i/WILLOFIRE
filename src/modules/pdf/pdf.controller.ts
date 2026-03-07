import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PdfService } from './pdf.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

/**
 * PdfController — THIN controller
 *
 * Fully wired to JWT auth via the global JwtAuthGuard (set in AppModule).
 * All routes are protected by default; @CurrentUser() extracts the real user.
 */
@Controller('pdf')
export class PdfController {
    constructor(private readonly pdfService: PdfService) { }

    /**
     * POST /api/v1/pdf/upload
     * Upload and enqueue a PDF for processing.
     * Uses FileInterceptor for multipart/form-data.
     * Validates file size (50MB max) and type (application/pdf).
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
            }),
        )
        file: Express.Multer.File,
        @CurrentUser() user: RequestUser,
    ): Promise<{ pdfId: string; status: string }> {
        return this.pdfService.uploadAndEnqueue(file, user.userId);
    }

    /**
     * GET /api/v1/pdf
     * List all PDFs for the authenticated user.
     */
    @Get()
    async findAll(@CurrentUser() user: RequestUser): Promise<unknown> {
        return this.pdfService.findAll(user.userId);
    }

    /**
     * GET /api/v1/pdf/:id
     * Get a specific PDF document and its processing status.
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<unknown> {
        return this.pdfService.findOne(id);
    }
}
