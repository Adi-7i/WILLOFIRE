import { Injectable, Inject, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import * as https from 'https';
import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { REDIS_CLIENT } from '../../redis/redis.constants';
import { PDF_PROCESSING_QUEUE } from '../queue.constants';
import { PdfProcessingPayload } from '../queue.service';
import { STORAGE_TOKEN } from '../../storage/storage.interface';
import { StorageService } from '../../storage/storage.interface';
import { PdfRepository } from '../../../modules/pdf/repositories/pdf.repository';
import { PdfChunkRepository } from '../../../modules/pdf/repositories/pdf-chunk.repository';
import { PdfStatus } from '../../../modules/pdf/schemas/pdf.schema';

const CHUNK_SIZE = 700; // ~175 tokens per chunk (at ~4 chars/token)

@Injectable()
export class PdfProcessingWorker implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(PdfProcessingWorker.name);
    private worker!: Worker<PdfProcessingPayload, string, string>;

    constructor(
        private readonly config: ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject(STORAGE_TOKEN) private readonly storageService: StorageService,
        private readonly pdfRepository: PdfRepository,
        private readonly pdfChunkRepository: PdfChunkRepository,
    ) { }

    onModuleInit() {
        const enabled = this.config.get<boolean>('queue.enabled') ?? true;
        if (!enabled) {
            this.logger.warn(`Queue disabled; skipping worker init for: ${PDF_PROCESSING_QUEUE}`);
            return;
        }

        this.logger.log(`Initializing worker for queue: ${PDF_PROCESSING_QUEUE}`);

        this.worker = new Worker(
            PDF_PROCESSING_QUEUE,
            async (job: Job<PdfProcessingPayload>) => {
                return this.processJob(job);
            },
            {
                connection: this.redis,
                concurrency: 2, // Process up to 2 PDFs concurrently per container
            },
        );

        this.worker.on('failed', (job, err) => {
            this.logger.error(`Job [${job?.id}] failed:`, err);
        });

        this.worker.on('error', (err) => {
            this.logger.error('Worker experienced a general error:', err);
        });
    }

    async onApplicationShutdown() {
        this.logger.log(`Closing worker: ${PDF_PROCESSING_QUEUE}`);
        await this.worker?.close();
    }

    /**
     * 8-Stage Pipeline:
     * 1. Fetch metadata
     * 2. Mark processing
     * 3. Get SAS URL
     * 4. Download file bytes
     * 5. Parse text via pdf-parse
     * 6. Chunk text
     * 7. Bulk store chunks
     * 8. Mark ready
     */
    private async processJob(job: Job<PdfProcessingPayload>): Promise<string> {
        const { pdfId, userId, fileKey } = job.data;
        this.logger.log(`[PdfWorker] Started processing PDF ${pdfId} for User ${userId}`);

        try {
            // 1. Fetch PDF record
            const pdf = await this.pdfRepository.findById(pdfId);
            if (!pdf) {
                throw new Error(`PDF record ${pdfId} not found in database.`);
            }

            // 2. Mark as processing
            await this.pdfRepository.updateStatus(pdfId, PdfStatus.PROCESSING);

            // 3. Get signed URL
            const signedUrl = await this.storageService.getSignedUrl(fileKey);

            // 4. Download PDF
            this.logger.debug(`[PdfWorker] Downloading fileKey: ${fileKey}`);
            const pdfBuffer = await this.downloadBuffer(signedUrl);

            // 5. Parse PDF text
            const parser = new PDFParse({ data: pdfBuffer, verbosity: VerbosityLevel.ERRORS });
            const textResult = await parser.getText();
            const infoResult = await parser.getInfo();
            await parser.destroy();

            const fullText = textResult.text;
            const parsedPageCount = infoResult.total ?? 0;

            // 6. Chunking (deterministic, naive char-based)
            const chunksData = this.chunkText(fullText, CHUNK_SIZE, pdfId);

            // 7. Store Chunks
            if (chunksData.length > 0) {
                // Clear old chunks in case of a retry/re-process
                await this.pdfChunkRepository.deleteByPdfId(pdfId);
                await this.pdfChunkRepository.createMany(chunksData);
                this.logger.debug(`[PdfWorker] Saved ${chunksData.length} chunks to DB.`);
            }

            // 8. Mark Ready
            await this.pdfRepository.updateStatus(pdfId, PdfStatus.READY, parsedPageCount);

            this.logger.log(`[PdfWorker] Finished processing PDF ${pdfId} successfully.`);
            return `Processed PDF ${pdfId}. Created ${chunksData.length} chunks.`;
        } catch (error) {
            this.logger.error(`[PdfWorker] Failed processing PDF ${pdfId}:`, error);
            // Mark as failed so UI knows
            await this.pdfRepository.updateStatus(pdfId, PdfStatus.FAILED).catch((dbErr) => {
                this.logger.error('Additionally failed to save FAILED status to DB:', dbErr);
            });
            // Rethrow so BullMQ triggers retry policy based on attempts left
            throw error;
        }
    }

    /**
     * Helper to download a file from a public Signed URL into memory.
     */
    private downloadBuffer(url: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            https
                .get(url, (res) => {
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Failed to download file. Status: ${res.statusCode}`));
                    }
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk) => chunks.push(chunk));
                    res.on('end', () => resolve(Buffer.concat(chunks)));
                })
                .on('error', (err) => reject(err));
        });
    }

    /**
     * Naive chunking algorithm.
     * Splits text into pieces of maxLength, breaking at the nearest space/newline if possible.
     */
    private chunkText(
        text: string,
        maxLength: number,
        pdfId: string,
    ): { pdfId: string; content: string; pageNumber: number; chunkIndex: number }[] {
        const chunks = [];
        let currentIndex = 0;
        let fallbackPageNumber = 1; // Since pdf-parse merges all pages into one string, we fake pagination sequentially

        while (currentIndex < text.length) {
            let chunkEnd = currentIndex + maxLength;

            // Try to chop cleanly at a newline or space rather than mid-word
            if (chunkEnd < text.length) {
                const nextSpace = text.lastIndexOf(' ', chunkEnd);
                const nextNewline = text.lastIndexOf('\n', chunkEnd);
                const bestBoundary = Math.max(nextSpace, nextNewline);
                // If we found a space/newline in the last 20% of the chunk, clip there
                if (bestBoundary > currentIndex + maxLength * 0.8) {
                    chunkEnd = bestBoundary + 1;
                }
            }

            const chunkContent = text.slice(currentIndex, chunkEnd).trim();
            if (chunkContent.length > 0) {
                chunks.push({
                    pdfId,
                    content: chunkContent,
                    pageNumber: fallbackPageNumber,
                    chunkIndex: chunks.length,
                });

                // Faking roughly 3 chunks = 1 page for tracking purposes
                if (chunks.length % 3 === 0) fallbackPageNumber++;
            }

            currentIndex = chunkEnd;
        }

        return chunks;
    }
}
