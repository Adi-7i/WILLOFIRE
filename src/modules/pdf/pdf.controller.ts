import { Controller, Post, Get, Param, UseInterceptors } from '@nestjs/common';
import { PdfService } from './pdf.service';

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
     * TODO (Phase 2): @UseInterceptors(FileInterceptor('file'))
     */
    @Post('upload')
    async upload(): Promise<unknown> {
        // TODO (Phase 2): Accept UploadedFile, pass to pdfService.uploadAndEnqueue()
        return this.pdfService.upload();
    }

    /**
     * GET /api/v1/pdf
     * List all PDFs for the authenticated user.
     * TODO (Phase 2): Inject @CurrentUser() and paginate results.
     */
    @Get()
    async findAll(): Promise<unknown> {
        return this.pdfService.findAll();
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
