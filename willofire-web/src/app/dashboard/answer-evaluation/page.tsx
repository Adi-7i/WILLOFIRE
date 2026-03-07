'use client';

import { useMemo, useState } from 'react';
import { EvaluationUploadCard, EvalState } from '@/components/shared/EvaluationUploadCard';
import { EvaluationResultCard } from '@/components/shared/EvaluationResultCard';
import { FileText, ArrowRight } from 'lucide-react';
import { useEvaluationHistory, useEvaluationResult, useSubmitEvaluation } from '@/hooks/use-evaluation';

export default function AnswerEvaluationPage() {
    const [evalState, setEvalState] = useState<EvalState>('idle');
    const [progress, setProgress] = useState(0);
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
    const [activeQuestionRef, setActiveQuestionRef] = useState<string>('');

    const submitMutation = useSubmitEvaluation();
    const historyQuery = useEvaluationHistory();
    const resultQuery = useEvaluationResult(activeSubmissionId ?? undefined, Boolean(activeSubmissionId));


    const handleSubmit = async ({ questionRef, file }: { questionRef: string; file: File }) => {
        try {
            setEvalState('uploading');
            setProgress(30);

            const submission = await submitMutation.mutateAsync({ questionRef, file });
            setProgress(100);
            setEvalState('evaluating');
            setActiveSubmissionId(submission.submissionId);
            setActiveQuestionRef(questionRef);
        } catch {
            setEvalState('failed');
        }
    };

    const historyItems = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Answer Evaluation</h1>
                <p className="text-slate-500 mt-2">Upload handwritten or typed answers for instant grading and feedback.</p>
            </div>

            {resultQuery.data ? (
                <EvaluationResultCard result={resultQuery.data} questionRef={activeQuestionRef} />
            ) : (
                <EvaluationUploadCard
                    state={evalState === 'evaluating' ? 'evaluating' : evalState}
                    progress={progress}
                    errorMessage={submitMutation.error?.message ?? (resultQuery.isError ? 'Evaluation is still processing. Please wait.' : undefined)}
                    onSubmit={handleSubmit}
                />
            )}

            <div className="mt-12">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Previous Evaluations</h3>
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {historyQuery.isLoading ? (
                            <div className="p-5 text-sm text-slate-500">Loading history...</div>
                        ) : historyItems.length === 0 ? (
                            <div className="p-5 text-sm text-slate-500">No previous evaluations found.</div>
                        ) : (
                            historyItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.questionRef}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Intl.DateTimeFormat('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }).format(new Date(item.createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="px-2.5 py-1 rounded font-bold text-sm bg-slate-100 text-slate-700 uppercase">
                                            {item.type}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
