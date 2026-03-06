import { apiClient } from './client';
import { AskPdfPayload, AskPdfResponse } from './types';

interface LongQuestionPayload {
    pdfId: string;
    count: number;
    marks: number;
}

interface DownloadUrlResponse {
    downloadUrl: string;
}

export const aiApi = {
    askPdf: async (payload: AskPdfPayload): Promise<AskPdfResponse> => {
        const response = await apiClient.post<AskPdfResponse>('/api/v1/ai/pdf-qa', payload);
        return response.data;
    },

    downloadLongQuestionPdf: async (payload: LongQuestionPayload): Promise<string> => {
        const response = await apiClient.post<DownloadUrlResponse>('/api/v1/ai/long-question/download', payload);
        return response.data.downloadUrl;
    },
};
