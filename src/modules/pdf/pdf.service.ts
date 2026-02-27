import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';

import { StorageService } from '../../infrastructure/storage/storage.interface';
import { STORAGE_TOKEN } from '../../infrastructure/storage/storage.interface';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { PdfRepository } from './repositories/pdf.repository';
import { PdfDocument, PdfStatus } from './schemas/pdf.schema';

/**
 * PdfService — PDF processing business logic
 *
 * Responsibilities:
 *  - Validate uploaded file
 *  - Store file in cloud storage
 *  - Extract text from PDF
 *  - Chunk text for AI ingestion
 *  - Enqueue processing jobs via BullMQ
 *  - Persist metadata to MongoDB
 */
@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);

    constructor(
        @Inject(STORAGE_TOKEN) private readonly storageService: StorageService,
        private readonly queueService: QueueService,
        private readonly pdfRepository: PdfRepository,
    ) { }

    /**
     * Handles the end-to-end flow of receiving a PDF buffer via HTTP:
     * 1. Push to Blob Storage
     * 2. Insert MongoDB record
     * 3. Send message to BullMQ background worker
     */
    async uploadAndEnqueue(file: Express.Multer.File, userId: string): Promise<{ pdfId: string; status: string }> {
        this.logger.log(`Received PDF upload from User ${userId}: ${file.originalname}`);

        // 1. Upload to Storage (returns the Blob Key, not a public URL)
        const storageResult = await this.storageService.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            'pdf',
        );

        // 2. Persist to MongoDB
        const pdf = await this.pdfRepository.create({
            userId,
            originalName: file.originalname,
            fileUrl: storageResult.fileKey, // Used later to generate SAS token
            fileSizeBytes: file.size,
            status: PdfStatus.UPLOADED,
        });

        // 3. Enqueue Background Processing Job
        await this.queueService.enqueuePdfProcessingJob({
            pdfId: pdf.id,
            userId,
            fileKey: storageResult.fileKey,
        });

        return {
            pdfId: pdf.id,
            status: PdfStatus.UPLOADED,
        };
    }

    /**
     * Retrieves all PDFs uploaded by a given user.
     */
    async findAll(userId: string): Promise<PdfDocument[]> {
        return this.pdfRepository.findByUserId(userId);
    }

    /**
     * Retrieves a single PDF document by ID.
     */
    async findOne(id: string): Promise<PdfDocument> {
        const pdf = await this.pdfRepository.findById(id);
        if (!pdf) {
            throw new NotFoundException(`PDF with ID ${id} not found`);
        }
        return pdf;
    }
}
