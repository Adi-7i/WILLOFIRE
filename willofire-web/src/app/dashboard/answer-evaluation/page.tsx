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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Answer Evaluation</h1>
                <p className="text-muted-foreground mt-2">Upload handwritten or typed answers for instant grading and feedback.</p>
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
                <h3 className="text-base font-semibold text-foreground mb-4">Previous Evaluations</h3>
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {historyQuery.isLoading ? (
                            <div className="p-5 text-sm text-muted-foreground">Loading history...</div>
                        ) : historyItems.length === 0 ? (
                            <div className="p-5 text-sm text-muted-foreground">No previous evaluations found.</div>
                        ) : (
                            historyItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/35 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[rgba(46,74,98,0.22)] text-[#93ADBF] flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground group-hover:text-[#93ADBF] transition-colors">
                                                {item.questionRef}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Intl.DateTimeFormat('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }).format(new Date(item.createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="px-2.5 py-1 rounded font-bold text-sm bg-muted/55 text-foreground/85 uppercase">
                                            {item.type}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/80 group-hover:text-[#93ADBF] transition-colors" />
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
