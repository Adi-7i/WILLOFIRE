import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mcqApi } from '@/lib/api/mcq';
import { SubmitMcqAnswerDto } from '@/lib/api/types';

export const MCQ_TESTS_QUERY_KEY = ['mcq-tests'] as const;

export const useMcqTests = () => {
    return useQuery({
        queryKey: MCQ_TESTS_QUERY_KEY,
        queryFn: mcqApi.list,
        refetchInterval: 10000,
    });
};

export const useGenerateMcq = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mcqApi.generate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MCQ_TESTS_QUERY_KEY });
        },
    });
};

export const useMcqTest = (testId?: string) => {
    return useQuery({
        queryKey: ['mcq-test', testId],
        queryFn: () => mcqApi.getById(testId as string),
        enabled: Boolean(testId),
    });
};

export const useSubmitMcq = () => {
    return useMutation({
        mutationFn: ({ testId, answers }: { testId: string; answers: SubmitMcqAnswerDto[] }) => mcqApi.submit(testId, answers),
    });
};
