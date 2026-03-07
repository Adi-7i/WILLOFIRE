export interface PdfFile {
    id: string;
    name: string;
    size: string;
    uploadedAt: string;
    status: 'uploaded' | 'processing' | 'ready' | 'failed';
}
