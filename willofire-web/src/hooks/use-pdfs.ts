import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pdfApi } from '@/lib/api/pdf';

export const PDFS_QUERY_KEY = ['pdfs'] as const;

export const usePdfs = () => {
    return useQuery({
        queryKey: PDFS_QUERY_KEY,
        queryFn: pdfApi.list,
        refetchInterval: (query) => {
            const items = query.state.data ?? [];
            const hasPending = items.some((pdf) => pdf.status === 'uploaded' || pdf.status === 'processing');
            return hasPending ? 5000 : false;
        },
    });
};

export const useUploadPdf = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
            pdfApi.upload(file, onProgress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PDFS_QUERY_KEY });
        },
    });
};
