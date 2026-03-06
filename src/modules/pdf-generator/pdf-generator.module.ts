import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';

/**
 * PdfGeneratorModule
 *
 * Provides a shared, isolated service for generating PDF documents
 * via pdfkit buffers. Features like MCQ Tests, Answer Keys, and AI
 * Long Questions leverage this to keep layout specifics out of business logic.
 */
@Module({
    providers: [PdfGeneratorService],
    exports: [PdfGeneratorService],
})
export class PdfGeneratorModule { }
