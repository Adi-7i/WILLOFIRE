import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

/**
 * PdfModule
 *
 * Owns PDF ingestion, parsing, and storage:
 *  - Multipart file upload handling
 *  - PDF text extraction
 *  - Chunk storage for AI processing
 *  - File metadata persistence
 *
 * Phase 1: Structure only.
 */
@Module({
    imports: [
        // TODO (Phase 2): MongooseModule for PdfDocument schema
        // TODO (Phase 2): BullModule.registerQueue({ name: 'pdf-processing' })
        // TODO (Phase 2): StorageModule
    ],
    controllers: [PdfController],
    providers: [PdfService],
    exports: [PdfService],
})
export class PdfModule { }
