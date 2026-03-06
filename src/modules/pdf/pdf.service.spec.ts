import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfRepository } from './repositories/pdf.repository';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { STORAGE_TOKEN } from '../../infrastructure/storage/storage.interface';
import { PdfStatus } from './schemas/pdf.schema';

describe('PdfService', () => {
    let service: PdfService;
    let mockStorageService: any;
    let mockQueueService: any;
    let mockPdfRepository: any;

    beforeEach(async () => {
        mockStorageService = {
            uploadFile: jest.fn(),
            getSignedUrl: jest.fn(),
        };

        mockQueueService = {
            enqueuePdfProcessingJob: jest.fn(),
        };

        mockPdfRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PdfService,
                { provide: STORAGE_TOKEN, useValue: mockStorageService },
                { provide: QueueService, useValue: mockQueueService },
                { provide: PdfRepository, useValue: mockPdfRepository },
            ],
        }).compile();

        service = module.get<PdfService>(PdfService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadAndEnqueue', () => {
        it('should successfully upload file, create DB record, and enqueue job', async () => {
            const mockFile = {
                originalname: 'test.pdf',
                buffer: Buffer.from('test-pdf-content'),
                mimetype: 'application/pdf',
                size: 1024,
            } as Express.Multer.File;

            mockStorageService.uploadFile.mockResolvedValue({
                fileKey: 'pdf/test-123.pdf',
                publicUrl: 'http://blob/test-123.pdf'
            });
            mockPdfRepository.create.mockResolvedValue({ id: 'doc-id-123', status: PdfStatus.UPLOADED });
            mockQueueService.enqueuePdfProcessingJob.mockResolvedValue(true);

            const result = await service.uploadAndEnqueue(mockFile, 'user-123');

            expect(result).toHaveProperty('pdfId', 'doc-id-123');
            expect(result).toHaveProperty('status', PdfStatus.UPLOADED);

            expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
                mockFile.buffer,
                mockFile.originalname,
                mockFile.mimetype,
                'pdf'
            );
            expect(mockPdfRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-123',
                originalName: 'test.pdf',
                fileUrl: 'pdf/test-123.pdf',
                status: PdfStatus.UPLOADED,
            }));
            expect(mockQueueService.enqueuePdfProcessingJob).toHaveBeenCalledWith({
                pdfId: 'doc-id-123',
                userId: 'user-123',
                fileKey: 'pdf/test-123.pdf',
            });
        });

        it('should safely propagate storage upload errors', async () => {
            const mockFile = {
                originalname: 'test.pdf',
                buffer: Buffer.from('test'),
                mimetype: 'application/pdf',
                size: 10,
            } as Express.Multer.File;

            mockStorageService.uploadFile.mockRejectedValue(new Error('Azure blob down'));

            await expect(service.uploadAndEnqueue(mockFile, 'user-1')).rejects.toThrow('Azure blob down');

            // Should not create DB record or enqueue if storage fails
            expect(mockPdfRepository.create).not.toHaveBeenCalled();
            expect(mockQueueService.enqueuePdfProcessingJob).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return PDF if found', async () => {
            mockPdfRepository.findById.mockResolvedValue({ id: '123' });

            const result = await service.findOne('123');

            expect(result.id).toBe('123');
        });

        it('should throw NotFoundException if missing', async () => {
            mockPdfRepository.findById.mockResolvedValue(null);

            await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
        });
    });
});
