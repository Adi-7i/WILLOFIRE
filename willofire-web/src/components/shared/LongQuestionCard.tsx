import { Badge } from '@/components/ui/badge';

interface LongQuestionCardProps {
    index: number;
    question: string;
    marks: number;
}

export function LongQuestionCard({ index, question, marks }: LongQuestionCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col relative w-full">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />

            <div className="p-6 md:p-8 pl-8 md:pl-10">
                <div className="flex gap-4 relative">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                        {index + 1}
                    </span>
                    <div className="flex-1 pr-16 md:pr-24">
                        <h3 className="text-lg font-medium text-slate-900 leading-relaxed pt-1 whitespace-pre-wrap">
                            {question}
                        </h3>
                    </div>
                </div>

                <div className="absolute top-4 right-4 md:top-6 md:right-8">
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-0 font-medium whitespace-nowrap">
                        {marks} marks
                    </Badge>
                </div>
            </div>
        </div>
    );
}
