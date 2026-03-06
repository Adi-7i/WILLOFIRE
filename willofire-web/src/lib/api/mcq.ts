import { apiClient } from './client';
import { McqTestDto, SubmitMcqAnswerDto, SubmitMcqResponse } from './types';

interface GenerateMcqPayload {
    pdfId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
}

interface DownloadUrlResponse {
    downloadUrl: string;
}

interface RawMcqQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface RawMcqTest {
    _id?: string;
    id?: string;
    pdfId: string;
    title: string;
    totalQuestions: number;
    questions: RawMcqQuestion[];
    createdAt: string;
}

const mapTest = (item: RawMcqTest): McqTestDto => ({
    id: item.id ?? item._id ?? '',
    pdfId: item.pdfId,
    title: item.title,
    totalQuestions: item.totalQuestions,
    questions: item.questions,
    createdAt: item.createdAt,
});

export const mcqApi = {
    generate: async (payload: GenerateMcqPayload): Promise<{ status: string; message: string }> => {
        const response = await apiClient.post<{ status: string; message: string }>('/api/v1/mcq/generate', payload);
        return response.data;
    },

    list: async (): Promise<McqTestDto[]> => {
        const response = await apiClient.get<RawMcqTest[]>('/api/v1/mcq');
        return response.data.map(mapTest);
    },

    getById: async (id: string): Promise<McqTestDto> => {
        const response = await apiClient.get<RawMcqTest>(`/api/v1/mcq/${id}`);
        return mapTest(response.data);
    },

    submit: async (testId: string, answers: SubmitMcqAnswerDto[]): Promise<SubmitMcqResponse> => {
        const response = await apiClient.post<SubmitMcqResponse>(`/api/v1/mcq/${testId}/submit`, { answers });
        return response.data;
    },

    downloadTest: async (testId: string): Promise<string> => {
        const response = await apiClient.get<DownloadUrlResponse>(`/api/v1/mcq/${testId}/download`);
        return response.data.downloadUrl;
    },

    downloadAnswerKey: async (testId: string): Promise<string> => {
        const response = await apiClient.get<DownloadUrlResponse>(`/api/v1/mcq/${testId}/download-answer-key`);
        return response.data.downloadUrl;
    },
};
