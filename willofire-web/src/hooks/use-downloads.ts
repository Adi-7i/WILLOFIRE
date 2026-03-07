import { useMutation, useQuery } from '@tanstack/react-query';
import { downloadsApi } from '@/lib/api/downloads';

export const DOWNLOADS_QUERY_KEY = ['downloads'] as const;

export const useDownloads = () => {
    return useQuery({
        queryKey: DOWNLOADS_QUERY_KEY,
        queryFn: downloadsApi.list,
        staleTime: 30000,
    });
};

export const useDownloadAction = () => {
    return useMutation({
        mutationFn: async (action: () => Promise<string>) => {
            const url = await action();
            if (typeof window !== 'undefined') {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
            return url;
        },
    });
};
