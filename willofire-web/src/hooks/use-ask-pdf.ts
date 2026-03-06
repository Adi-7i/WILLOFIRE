import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai';
import { AskPdfPayload, AskPdfResponse } from '@/lib/api/types';

interface AskHistoryItem {
    id: string;
    question: string;
    time: string;
}

export const ASK_PDF_HISTORY_KEY = ['ask-pdf-history'] as const;

const makeHistoryItem = (question: string): AskHistoryItem => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    time: 'Just now',
});

export const useAskPdf = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AskPdfPayload) => aiApi.askPdf(payload),
        onSuccess: (_data: AskPdfResponse, variables) => {
            queryClient.setQueryData<AskHistoryItem[]>(ASK_PDF_HISTORY_KEY, (prev) => {
                const current = prev ?? [];
                return [makeHistoryItem(variables.question), ...current].slice(0, 10);
            });
        },
    });
};

export const useAskPdfHistory = () => {
    return useQuery({
        queryKey: ASK_PDF_HISTORY_KEY,
        queryFn: async () => [],
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
