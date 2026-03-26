import { Trophy, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { McqQuestion } from '@/types/mcq';
import { McqCard } from './McqCard';
import { SubmitMcqResponse } from '@/lib/api/types';

interface ResultCardProps {
    questions: McqQuestion[];
    userAnswers: Record<string, string>;
    result: SubmitMcqResponse;
    onRetake: () => void;
    onBack: () => void;
}

export function ResultCard({ questions, userAnswers, result, onRetake, onBack }: ResultCardProps) {
    const percentage = Math.round(result.score);

    let message = 'Good effort!';
    if (percentage >= 90) message = 'Excellent work!';
    else if (percentage >= 70) message = 'Well done!';
    else if (percentage < 50) message = 'Needs review.';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-24">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-center p-8 md:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-2 wf-accent-gradient" />

                <div className="mx-auto w-20 h-20 bg-[rgba(63,110,106,0.16)] rounded-full flex items-center justify-center mb-6">
                    <Trophy className="h-10 w-10 text-[#89A09D]" />
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{percentage}%</h2>
                <p className="text-lg text-muted-foreground font-medium mt-2">{message}</p>

                <div className="flex items-center justify-center gap-6 mt-8">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[#84AC9F]" />
                        <span className="text-base font-medium text-foreground/85">{result.correct} Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-base font-medium text-foreground/85">{result.incorrect} Incorrect</span>
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-4">
                    <Button onClick={onRetake} variant="outline" className="border-border text-foreground/85 h-11 px-8">
                        Retake Test
                    </Button>
                    <Button onClick={onBack} className="wf-accent-gradient text-primary-foreground h-11 px-8 wf-soft-glow-hover">
                        Return to Tests
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 px-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground/80" />
                <h3 className="text-lg font-semibold text-foreground">Detailed Review</h3>
            </div>

            <div className="space-y-6">
                {questions.map((q, index) => (
                    <McqCard
                        key={q.id}
                        question={q}
                        index={index}
                        selectedOptionId={userAnswers[q.id]}
                        isReviewMode={true}
                    />
                ))}
            </div>
        </div>
    );
}
