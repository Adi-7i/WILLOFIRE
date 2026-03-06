import { Trophy, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { McqQuestion } from '@/types/mcq';
import { McqCard } from './McqCard';

interface ResultCardProps {
    questions: McqQuestion[];
    userAnswers: Record<string, string>;
    onRetake: () => void;
}

export function ResultCard({ questions, userAnswers, onRetake }: ResultCardProps) {
    let correctCount = 0;

    questions.forEach((q) => {
        if (userAnswers[q.id] === q.correctOptionId) {
            correctCount++;
        }
    });

    const total = questions.length;
    const incorrectCount = total - correctCount;
    const percentage = Math.round((correctCount / total) * 100);

    let message = "Good effort!";
    if (percentage >= 90) message = "Excellent work!";
    else if (percentage >= 70) message = "Well done!";
    else if (percentage < 50) message = "Needs review.";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-24">
            {/* Score Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center p-8 md:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-amber-500" />

                <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="h-10 w-10 text-amber-500" />
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {percentage}%
                </h2>
                <p className="text-lg text-slate-500 font-medium mt-2">{message}</p>

                <div className="flex items-center justify-center gap-6 mt-8">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-base font-medium text-slate-700">{correctCount} Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-base font-medium text-slate-700">{incorrectCount} Incorrect</span>
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-4">
                    <Button onClick={onRetake} variant="outline" className="border-slate-300 text-slate-700 h-11 px-8">
                        Retake Test
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8">
                        Return to Dashboard
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 px-2">
                <AlertCircle className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Detailed Review</h3>
            </div>

            {/* Review List */}
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
