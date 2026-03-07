'use client';

import { QuestionPanel } from '@/components/shared/QuestionPanel';
import { AnswerPanel } from '@/components/shared/AnswerPanel';
import { useAskPdf, useAskPdfHistory } from '@/hooks/use-ask-pdf';
import { usePdfs } from '@/hooks/use-pdfs';

export default function AskPdfPage() {
    const askPdf = useAskPdf();
    const historyQuery = useAskPdfHistory();
    const pdfsQuery = usePdfs();

    const readyPdfs = (pdfsQuery.data ?? []).filter((pdf) => pdf.status === 'ready');

    const handleAskQuestion = (question: string, pdfId: string) => {
        askPdf.mutate({ question, pdfId });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ask PDF</h1>
                <p className="text-slate-500 mt-2">Chat with your study materials using our AI tutor.</p>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 lg:col-start-1 h-full">
                    <QuestionPanel onAsk={handleAskQuestion} isLoading={askPdf.isPending} readyPdfs={readyPdfs} />
                </div>

                <div className="lg:col-span-8 lg:col-start-5 h-full">
                    <AnswerPanel
                        answer={askPdf.data?.answer ?? null}
                        isLoading={askPdf.isPending}
                        hasAnswered={askPdf.isSuccess}
                        sources={askPdf.data?.sources ?? []}
                        history={historyQuery.data ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
