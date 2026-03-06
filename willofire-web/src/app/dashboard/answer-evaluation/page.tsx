'use client';

import { useState } from 'react';
import { EvaluationUploadCard, EvalState } from '@/components/shared/EvaluationUploadCard';
import { EvaluationResultCard } from '@/components/shared/EvaluationResultCard';
import { FileText, ArrowRight } from 'lucide-react';

const DUMMY_HISTORY = [
    { id: '1', title: 'Q1 from Physics Mock Test', date: 'Oct 12, 2023', score: '7.5/10', grade: 'B' },
    { id: '2', title: 'Short Ans 4 - Chemistry', date: 'Oct 10, 2023', score: '9/10', grade: 'A' },
    { id: '3', title: 'Essay Section - English', date: 'Sep 28, 2023', score: '6/10', grade: 'C' },
];

export default function AnswerEvaluationPage() {
    const [evalState, setEvalState] = useState<EvalState>('idle');
    const [progress, setProgress] = useState(0);

    const getBadgeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-700';
            case 'B': return 'bg-blue-100 text-blue-700';
            case 'C': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Answer Evaluation
                </h1>
                <p className="text-slate-500 mt-2">
                    Upload handwritten or typed answers for instant grading and feedback.
                </p>
            </div>

            {evalState === 'completed' && (
                <EvaluationResultCard />
            )}

            {evalState !== 'completed' && (
                <EvaluationUploadCard
                    state={evalState}
                    onUploadStart={() => setEvalState('uploading')}
                    onUploadProgress={setProgress}
                    onEvaluating={() => setEvalState('evaluating')}
                    onCompleted={() => setEvalState('completed')}
                />
            )}

            {/* History Section */}
            <div className="mt-12">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Previous Evaluations</h3>
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {DUMMY_HISTORY.map((item) => (
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
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-2.5 py-1 rounded font-bold text-sm ${getBadgeColor(item.grade)}`}>
                                        {item.score}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
