import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { McqService } from './mcq.service';
import { PdfRepository } from '../pdf/repositories/pdf.repository';
import { QueueService } from '../../infrastructure/queues/queue.service';
import { McqTestRepository } from './repositories/mcq-test.repository';
import { McqAttemptRepository } from './repositories/mcq-attempt.repository';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';
import { STORAGE_TOKEN } from '../../infrastructure/storage/storage.interface';

describe('McqService', () => {
    let service: McqService;
    let mockPdfRepository: any;
    let mockQueueService: any;
    let mockMcqTestRepository: any;
    let mockMcqAttemptRepository: any;
    let mockPdfGeneratorService: any;
    let mockStorageService: any;

    beforeEach(async () => {
        mockPdfRepository = {
            findById: jest.fn(),
        };

        mockQueueService = {
            enqueueMcqGenerationJob: jest.fn(),
        };

        mockMcqTestRepository = {
            findById: jest.fn(),
        };

        mockMcqAttemptRepository = {
            create: jest.fn(),
        };

        mockPdfGeneratorService = {
            generateMcqTestPdf: jest.fn(),
        };

        mockStorageService = {
            uploadFile: jest.fn(),
            getSignedUrl: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                McqService,
                { provide: PdfRepository, useValue: mockPdfRepository },
                { provide: QueueService, useValue: mockQueueService },
                { provide: McqTestRepository, useValue: mockMcqTestRepository },
                { provide: McqAttemptRepository, useValue: mockMcqAttemptRepository },
                { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
                { provide: STORAGE_TOKEN, useValue: mockStorageService },
            ],
        }).compile();

        service = module.get<McqService>(McqService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should execute generation job successfully', async () => {
            mockPdfRepository.findById.mockResolvedValue({ _id: 'pdf-123', userId: 'user-1' });

            const dto = { pdfId: 'pdf-123', difficulty: 'hard' as const, count: 10 };
            const result = await service.generate(dto, 'user-1');

            expect(result.status).toBe('queued');
            expect(mockQueueService.enqueueMcqGenerationJob).toHaveBeenCalledWith({
                pdfId: 'pdf-123',
                userId: 'user-1',
                numQuestions: 10,
                difficulty: 'hard',
            });
        });

        it('should throw NotFoundException if PDF not owned', async () => {
            // Owned by user-2, requested by user-1
            mockPdfRepository.findById.mockResolvedValue({ _id: 'pdf-123', userId: 'user-2' });

            const dto = { pdfId: 'pdf-123', difficulty: 'easy' as const, count: 5 };
            await expect(service.generate(dto, 'user-1')).rejects.toThrow(NotFoundException);

            expect(mockQueueService.enqueueMcqGenerationJob).not.toHaveBeenCalled();
        });
    });

    describe('submit', () => {
        const mockTest = {
            _id: 'test-123',
            userId: 'user-1',
            totalQuestions: 2,
            questions: [
                { question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'A is right' },
                { question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 2, explanation: 'C is right' }
            ]
        };

        it('should grade correct and skipped scoring accurately', async () => {
            mockMcqTestRepository.findById.mockResolvedValue(mockTest);
            mockMcqAttemptRepository.create.mockResolvedValue({ _id: 'attempt-123' });

            const dto = {
                answers: [
                    { questionIndex: 0, selectedOption: 0 }, // Correct (+1)
                    { questionIndex: 1, selectedOption: -1 } // Skipped (neither correct nor incorrect)
                ]
            };

            const result = await service.submit('test-123', dto, 'user-1');

            expect(result.score).toBe(50); // 1/2 correct
            expect(result.correct).toBe(1);
            expect(result.incorrect).toBe(0); // Because one was skipped
            expect(mockMcqAttemptRepository.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if test not found', async () => {
            mockMcqTestRepository.findById.mockResolvedValue(null);

            await expect(service.submit('fake-test', { answers: [] }, 'user-1')).rejects.toThrow(NotFoundException);
        });
    });
});
