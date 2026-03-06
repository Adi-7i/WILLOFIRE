export interface PdfFile {
    id: string;
    name: string;
    size: string;
    uploadedAt: string;
    status: 'uploaded' | 'processing' | 'ready' | 'failed';
}

export const DUMMY_PDFS: PdfFile[] = [
    {
        id: '1',
        name: 'Chapter_4_Thermodynamics.pdf',
        size: '2.4 MB',
        uploadedAt: 'Today, 2:30 PM',
        status: 'ready',
    },
    {
        id: '2',
        name: 'Organic_Chemistry_Reactions.pdf',
        size: '1.8 MB',
        uploadedAt: 'Yesterday, 11:15 AM',
        status: 'ready',
    },
    {
        id: '3',
        name: 'Calculus_Integration_Practice.pdf',
        size: '4.2 MB',
        uploadedAt: 'Oct 12, 2023',
        status: 'processing',
    },
    {
        id: '4',
        name: 'Corrupted_File_Test.pdf',
        size: '0.1 MB',
        uploadedAt: 'Oct 10, 2023',
        status: 'failed',
    },
];
