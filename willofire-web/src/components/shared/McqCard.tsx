import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { McqQuestion } from '@/types/mcq';
import { Check, X } from 'lucide-react';

interface McqCardProps {
    question: McqQuestion;
    index: number;
    selectedOptionId?: string;
    onSelect?: (optionId: string) => void;
    isReviewMode?: boolean;
}

export function McqCard({ question, index, selectedOptionId, onSelect, isReviewMode = false }: McqCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />

            <div className="p-6 md:p-8 pl-8 md:pl-10">
                <div className="flex gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                        {index + 1}
                    </span>
                    <h3 className="text-lg font-medium text-slate-900 leading-snug pt-1">
                        {question.question}
                    </h3>
                </div>

                <div className="mt-8 ml-0 md:ml-12">
                    {!isReviewMode ? (
                        <RadioGroup
                            value={selectedOptionId}
                            onValueChange={onSelect}
                            className="space-y-3"
                        >
                            {question.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-slate-50 ${selectedOptionId === option.id
                                            ? 'border-blue-500 bg-blue-50/50 hover:bg-blue-50'
                                            : 'border-slate-200'
                                        }`}
                                    onClick={() => onSelect?.(option.id)}
                                >
                                    <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
                                    <Label
                                        htmlFor={`q${question.id}-${option.id}`}
                                        className="flex-1 cursor-pointer font-normal text-base text-slate-700 leading-normal"
                                    >
                                        {option.text}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    ) : (
                        <div className="space-y-3">
                            {question.options.map((option) => {
                                const isSelected = selectedOptionId === option.id;
                                const isCorrect = option.id === question.correctOptionId;

                                let borderColor = 'border-slate-200';
                                let bgColor = 'bg-white';
                                let Icon = null;

                                if (isCorrect) {
                                    borderColor = 'border-green-500';
                                    bgColor = 'bg-green-50/50';
                                    Icon = <Check className="h-5 w-5 text-green-500" />;
                                } else if (isSelected && !isCorrect) {
                                    borderColor = 'border-red-300';
                                    bgColor = 'bg-red-50/50';
                                    Icon = <X className="h-5 w-5 text-red-500" />;
                                }

                                return (
                                    <div
                                        key={option.id}
                                        className={`flex items-center space-x-3 rounded-lg border p-4 ${borderColor} ${bgColor}`}
                                    >
                                        <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />}
                                        </div>
                                        <span className="flex-1 font-normal text-base text-slate-700 leading-normal">
                                            {option.text}
                                        </span>
                                        {Icon}
                                    </div>
                                );
                            })}

                            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-sm font-semibold text-slate-900 mb-1">Explanation</p>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {question.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
