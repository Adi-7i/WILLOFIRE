import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evaluationApi } from '@/lib/api/evaluation';

export const EVALUATION_HISTORY_KEY = ['evaluation-history'] as const;

export const useSubmitEvaluation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: evaluationApi.submit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EVALUATION_HISTORY_KEY });
        },
    });
};

export const useEvaluationResult = (submissionId?: string, enabled = true) => {
    return useQuery({
        queryKey: ['evaluation-result', submissionId],
        queryFn: () => evaluationApi.getResult(submissionId as string),
        enabled: Boolean(submissionId) && enabled,
        retry: false,
        refetchInterval: 4000,
    });
};

export const useEvaluationHistory = () => {
    return useQuery({
        queryKey: EVALUATION_HISTORY_KEY,
        queryFn: evaluationApi.getHistory,
        staleTime: 60000,
    });
};
