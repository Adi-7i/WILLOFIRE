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
    // UseGuards, // TODO: Uncomment when JwtAuthGuard is ready
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PdfService } from './pdf.service';
// import { CurrentUser } from '../auth/decorators/current-user.decorator'; // TODO: Uncomment when ready

/**
 * PdfController — THIN controller
 *
 * Delegates all PDF handling logic to PdfService.
 * TODO (Phase 2): Add @UseGuards(JwtAuthGuard), FileInterceptor for multipart uploads.
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
    // @UseGuards(JwtAuthGuard) // TODO
    @UseInterceptors(FileInterceptor('file')) // Expects the multipart field name to be 'file'
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    // 50 MB in bytes
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
            }),
        )
        file: Express.Multer.File,
        // @CurrentUser() user: any // TODO
    ): Promise<{ pdfId: string; status: string }> {
        // TEMPORARY placeholder userId until AuthModule features are linked
        const placeholderUserId = '64f1b2c3d4e5f6a7b8c9d0e1';

        return this.pdfService.uploadAndEnqueue(file, placeholderUserId);
    }

    /**
     * GET /api/v1/pdf
     * List all PDFs for the authenticated user.
     * TODO (Phase 2): Inject @CurrentUser() and paginate results.
     */
    @Get()
    async findAll(): Promise<unknown> {
        // TEMPORARY placeholder userId until AuthModule features are linked
        const placeholderUserId = '64f1b2c3d4e5f6a7b8c9d0e1';
        return this.pdfService.findAll(placeholderUserId);
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
