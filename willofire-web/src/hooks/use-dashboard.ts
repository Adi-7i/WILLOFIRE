import { useQuery } from '@tanstack/react-query';
import { pdfApi } from '@/lib/api/pdf';
import { mcqApi } from '@/lib/api/mcq';
import { evaluationApi } from '@/lib/api/evaluation';

export interface DashboardStats {
    pdfsUploaded: number;
    mockTestsTaken: number;
    evaluations: number;
    pdfQuestions: number;
}

export interface DashboardActivityItem {
    id: string;
    title: string;
    description: string;
    timestamp: string;
}

const timeAgo = (isoDate: string): string => {
    const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day ago`;
};

export const useDashboardData = () => {
    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const [pdfs, tests, evaluations] = await Promise.all([
                pdfApi.list(),
                mcqApi.list(),
                evaluationApi.getHistory(),
            ]);

            const stats: DashboardStats = {
                pdfsUploaded: pdfs.length,
                mockTestsTaken: tests.length,
                evaluations: evaluations.length,
                pdfQuestions: tests.reduce((total, test) => total + test.totalQuestions, 0),
            };

            const activityWithDate = [
                ...pdfs.slice(0, 5).map((pdf) => ({
                    id: `pdf-${pdf.id}`,
                    title: 'Uploaded PDF',
                    description: pdf.originalName,
                    dateMs: new Date(pdf.createdAt).getTime(),
                    timestamp: timeAgo(pdf.createdAt),
                })),
                ...tests.slice(0, 5).map((test) => ({
                    id: `mcq-${test.id}`,
                    title: 'Generated Mock Test',
                    description: test.title,
                    dateMs: new Date(test.createdAt).getTime(),
                    timestamp: timeAgo(test.createdAt),
                })),
                ...evaluations.slice(0, 5).map((evaluation) => ({
                    id: `eval-${evaluation.id}`,
                    title: 'Submitted Evaluation',
                    description: evaluation.questionRef,
                    dateMs: new Date(evaluation.createdAt).getTime(),
                    timestamp: timeAgo(evaluation.createdAt),
                })),
            ];

            const activity: DashboardActivityItem[] = activityWithDate
                .sort((a, b) => b.dateMs - a.dateMs)
                .slice(0, 8)
                .map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    timestamp: item.timestamp,
                }));

            return { stats, activity };
        },
        staleTime: 30000,
    });
};
