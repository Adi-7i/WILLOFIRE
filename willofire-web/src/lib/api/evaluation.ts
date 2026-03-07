import { apiClient } from './client';
import { EvaluationHistoryItem, EvaluationResultResponse, EvaluationSubmitResponse } from './types';

interface SubmitEvaluationPayload {
    questionRef: string;
    file?: File;
}

interface RawEvaluationHistoryItem {
    _id?: string;
    id?: string;
    questionRef: string;
    type: 'pdf' | 'image' | 'text';
    createdAt: string;
}

const mapHistoryItem = (item: RawEvaluationHistoryItem): EvaluationHistoryItem => ({
    id: item.id ?? item._id ?? '',
    questionRef: item.questionRef,
    type: item.type,
    createdAt: item.createdAt,
});

export const evaluationApi = {
    submit: async (payload: SubmitEvaluationPayload): Promise<EvaluationSubmitResponse> => {
        const formData = new FormData();
        formData.append('questionRef', payload.questionRef);

        if (payload.file) {
            formData.append('file', payload.file);
        }

        const response = await apiClient.post<EvaluationSubmitResponse>('/api/v1/evaluation/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
    },

    getResult: async (submissionId: string): Promise<EvaluationResultResponse> => {
        const response = await apiClient.get<EvaluationResultResponse>(`/api/v1/evaluation/results/${submissionId}`);
        return response.data;
    },

    getHistory: async (): Promise<EvaluationHistoryItem[]> => {
        const response = await apiClient.get<RawEvaluationHistoryItem[] | { message: string }>('/api/v1/evaluation/history');
        if (!Array.isArray(response.data)) {
            return [];
        }
        return response.data.map(mapHistoryItem);
    },
};
