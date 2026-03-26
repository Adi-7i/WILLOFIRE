import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { EvaluationResultResponse } from '@/lib/api/types';

interface EvaluationResultCardProps {
    result: EvaluationResultResponse;
    questionRef?: string;
}

const toGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 45) return 'D';
    return 'E';
};

export function EvaluationResultCard({ result, questionRef }: EvaluationResultCardProps) {
    const grade = toGrade(result.score, result.maxScore);

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="border-b border-border bg-muted/35 px-6 md:px-8 py-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Evaluation Report</h2>
                    <p className="text-sm text-muted-foreground mt-1">For: {questionRef ?? 'Submitted answer'}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(46,74,98,0.22)] text-[#A7BDC8] rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Willofire AI • v{result.version}
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex items-center gap-6 mb-8 p-6 bg-muted/35 rounded-xl border border-border/70">
                    <div className="w-20 h-20 rounded-full wf-accent-gradient flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-2xl font-bold text-white">{result.score}/{result.maxScore}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-foreground">Grade: {grade}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">AI-generated rubric feedback for your submitted answer.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-[#84AC9F]" />
                            Key Strengths
                        </h3>
                        <ul className="space-y-3">
                            {result.strengths.length === 0 ? (
                                <li className="text-sm text-muted-foreground">No strengths identified yet.</li>
                            ) : (
                                result.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(63,110,106,0.16)]0 mt-2 shrink-0" />
                                        <span className="text-sm text-foreground/85 leading-relaxed">{strength}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-[#89A09D]" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {result.improvements.length === 0 ? (
                                <li className="text-sm text-muted-foreground">No improvements suggested.</li>
                            ) : (
                                result.improvements.map((improvement, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(63,110,106,0.16)]0 mt-2 shrink-0" />
                                        <span className="text-sm text-foreground/85 leading-relaxed">{improvement}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
