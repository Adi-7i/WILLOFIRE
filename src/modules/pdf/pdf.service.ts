import { Injectable, Logger } from '@nestjs/common';

/**
 * PdfService — PDF processing business logic
 *
 * Responsibilities (Phase 2+):
 *  - Validate uploaded file (type, size, virus scan)
 *  - Store file in cloud storage
 *  - Extract text from PDF
 *  - Chunk text for AI ingestion
 *  - Enqueue processing jobs via BullMQ
 *  - Persist metadata to MongoDB
 */
@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);

    async upload(): Promise<unknown> {
        this.logger.log('upload() called — not yet implemented');
        // TODO (Phase 2): Implement PDF upload & enqueue
        return { message: 'PDF upload — coming in Phase 2' };
    }

    async findAll(): Promise<unknown> {
        this.logger.log('findAll() called — not yet implemented');
        // TODO (Phase 2): Query MongoDB for user's PDFs
        return { message: 'PDF list — coming in Phase 2' };
    }

    async findOne(_id: string): Promise<unknown> {
        this.logger.log(`findOne(${_id}) called — not yet implemented`);
        // TODO (Phase 2): Query MongoDB for single PDF + processing status
        return { message: 'PDF detail — coming in Phase 2' };
    }
}
