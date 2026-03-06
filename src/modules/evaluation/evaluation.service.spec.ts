import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { AnswerSubmissionRepository } from './repositories/answer-submission.repository';
import { EvaluationResultRepository } from './repositories/evaluation-result.repository';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { STORAGE_TOKEN } from '../../infrastructure/storage/storage.interface';
import { SubmissionType } from './schemas/answer-submission.schema';

describe('EvaluationService', () => {
    let service: EvaluationService;
    let mockSubmissionRepo: any;
    let mockResultRepo: any;
    let mockQueueService: any;
    let mockStorageService: any;

    beforeEach(async () => {
        mockSubmissionRepo = {
            create: jest.fn(),
        };

        mockResultRepo = {
            findLatestBySubmissionId: jest.fn(),
        };

        mockQueueService = {
            enqueueEvaluationJob: jest.fn(),
        };

        mockStorageService = {
            uploadFile: jest.fn().mockResolvedValue({ publicUrl: 'http://blob/file' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EvaluationService,
                { provide: AnswerSubmissionRepository, useValue: mockSubmissionRepo },
                { provide: EvaluationResultRepository, useValue: mockResultRepo },
                { provide: QueueService, useValue: mockQueueService },
                { provide: STORAGE_TOKEN, useValue: mockStorageService },
            ],
        }).compile();

        service = module.get<EvaluationService>(EvaluationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('submit', () => {
        it('should process image/jpeg file accurately', async () => {
            const mockFile = {
                originalname: 'answer.jpg',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('img-data'),
            } as Express.Multer.File;

            mockSubmissionRepo.create.mockResolvedValue({ _id: 'sub-1' });

            const result = await service.submit({ questionRef: 'q1' }, mockFile, 'user-1');

            expect(result.status).toBe('queued');
            expect(mockStorageService.uploadFile).toHaveBeenCalled();
            expect(mockSubmissionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                type: SubmissionType.IMAGE
            }));
            expect(mockQueueService.enqueueEvaluationJob).toHaveBeenCalledWith({
                submissionId: 'sub-1', userId: 'user-1'
            });
        });

        it('should process application/pdf file accurately', async () => {
            const mockFile = {
                originalname: 'answer.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.from('pdf-data'),
            } as Express.Multer.File;

            mockSubmissionRepo.create.mockResolvedValue({ _id: 'sub-2' });

            await service.submit({ questionRef: 'q1' }, mockFile, 'user-1');

            expect(mockSubmissionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                type: SubmissionType.PDF
            }));
        });

        it('should reject unsupported file types', async () => {
            const mockFile = {
                originalname: 'malware.exe',
                mimetype: 'application/x-msdownload',
                buffer: Buffer.from('exe-data'),
            } as Express.Multer.File;

            await expect(service.submit({ questionRef: 'q1' }, mockFile, 'user-1'))
                .rejects.toThrow(BadRequestException);

            expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
            expect(mockQueueService.enqueueEvaluationJob).not.toHaveBeenCalled();
        });
    });

    describe('getResult', () => {
        it('should return evaluated answer payload securely', async () => {
            mockResultRepo.findLatestBySubmissionId.mockResolvedValue({
                score: 85,
                maxScore: 100,
                strengths: ['Good points'],
                improvements: ['Formatting'],
                version: 2
            });

            const result = await service.getResult('sub-1');

            expect(result.score).toBe(85);
            expect(result.version).toBe(2);
        });

        it('should throw NotFoundException if no result processed yet', async () => {
            mockResultRepo.findLatestBySubmissionId.mockResolvedValue(null);

            await expect(service.getResult('sub-missing')).rejects.toThrow(NotFoundException);
        });
    });
});
