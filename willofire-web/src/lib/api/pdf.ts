import { AxiosProgressEvent } from 'axios';
import { apiClient } from './client';
import { PdfListItem } from './types';

interface UploadPdfResponse {
    pdfId: string;
    status: string;
}

interface RawPdfItem {
    _id?: string;
    id?: string;
    originalName: string;
    fileSizeBytes: number;
    status: PdfListItem['status'];
    createdAt: string;
    pageCount?: number | null;
}

const mapPdf = (item: RawPdfItem): PdfListItem => ({
    id: item.id ?? item._id ?? '',
    originalName: item.originalName,
    fileSizeBytes: item.fileSizeBytes,
    status: item.status,
    createdAt: item.createdAt,
    pageCount: item.pageCount,
});

export const pdfApi = {
    upload: async (
        file: File,
        onProgress?: (progress: number) => void,
    ): Promise<UploadPdfResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<UploadPdfResponse>('/api/v1/pdf/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event: AxiosProgressEvent) => {
                if (!event.total || !onProgress) return;
                const progress = Math.round((event.loaded * 100) / event.total);
                onProgress(progress);
            },
        });

        return response.data;
    },

    list: async (): Promise<PdfListItem[]> => {
        const response = await apiClient.get<RawPdfItem[]>('/api/v1/pdf');
        return response.data.map(mapPdf);
    },

    getById: async (id: string): Promise<PdfListItem> => {
        const response = await apiClient.get<RawPdfItem>(`/api/v1/pdf/${id}`);
        return mapPdf(response.data);
    },
};
