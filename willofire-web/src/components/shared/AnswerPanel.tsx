import { Sparkles, FileQuestion, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HistoryItem {
    id: string;
    question: string;
    time: string;
}

interface AnswerPanelProps {
    answer: string | null;
    isLoading: boolean;
    hasAnswered: boolean;
    sources: number[];
    history: HistoryItem[];
}

export function AnswerPanel({ answer, isLoading, hasAnswered, sources, history }: AnswerPanelProps) {
    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                {!hasAnswered && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <FileQuestion className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">AI Tutor is Ready</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium">
                            Select a PDF and ask a question on the left. The AI will analyze the document and provide cited answers here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            <h3 className="text-base font-semibold text-slate-900">AI Response</h3>
                        </div>
                        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-8"></div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-700 leading-relaxed text-lg">{answer}</p>
                                    </div>

                                    {sources.length > 0 ? (
                                        <div className="pt-6 border-t border-slate-100">
                                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                                <BookOpen className="h-4 w-4 text-slate-400" /> References
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {sources.map((page) => (
                                                    <Badge
                                                        key={page}
                                                        variant="secondary"
                                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                                                    >
                                                        Page {page}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {(hasAnswered || isLoading) && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Recent Questions</h4>
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <p className="text-sm text-slate-500">No recent questions yet.</p>
                        ) : (
                            history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-start gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer text-left"
                                >
                                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.question}</p>
                                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{item.time}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
