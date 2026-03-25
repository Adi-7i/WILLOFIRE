'use client';

import { useMemo, useRef, useState } from 'react';
import { Manrope } from 'next/font/google';
import { useAskPdf } from '@/hooks/use-ask-pdf';
import { usePdfs } from '@/hooks/use-pdfs';
import { PdfControlPanel } from '@/components/shared/ask-pdf/PdfControlPanel';
import { ChatInputBar } from '@/components/shared/ask-pdf/ChatInputBar';
import { ChatMessage, ChatMessageList } from '@/components/shared/ask-pdf/ChatMessageList';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-manrope',
});

export default function AskPdfPage() {
    const askPdf = useAskPdf();
    const pdfsQuery = usePdfs();
    const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
    const [draft, setDraft] = useState('');
    const [model, setModel] = useState('exam-assistant-v1');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [thinkingStage, setThinkingStage] = useState<string | null>(null);
    const responseAnchorRef = useRef<HTMLDivElement | null>(null);

    const readyPdfs = (pdfsQuery.data ?? []).filter((pdf) => pdf.status === 'ready');
    const hasMessages = messages.length > 0;
    const isLoading = askPdf.isPending;
    const selectedPrimaryPdfId = selectedPdfIds[0] ?? '';

    const canAsk = selectedPdfIds.length > 0 && draft.trim().length > 0 && !isLoading;

    const togglePdf = (pdfId: string) => {
        setSelectedPdfIds((prev) => (prev.includes(pdfId) ? prev.filter((id) => id !== pdfId) : [...prev, pdfId]));
    };

    const removePdf = (pdfId: string) => {
        setSelectedPdfIds((prev) => prev.filter((id) => id !== pdfId));
    };

    const typeAssistantResponse = (id: string, fullText: string, sources: number[]) => {
        const chunkSize = fullText.length > 900 ? 22 : fullText.length > 500 ? 14 : 9;
        let index = 0;

        const timer = window.setInterval(() => {
            index = Math.min(index + chunkSize, fullText.length);
            setMessages((prev) =>
                prev.map((msg) => (msg.id === id ? { ...msg, text: fullText.slice(0, index), sources } : msg))
            );
            if (index >= fullText.length) {
                window.clearInterval(timer);
            }
        }, 24);
    };

    const submitQuestion = async () => {
        if (!canAsk || !selectedPrimaryPdfId) return;

        const question = draft.trim();
        setDraft('');

        const userId = `u-${Date.now()}`;
        const assistantId = `a-${Date.now() + 1}`;
        setMessages((prev) => [
            ...prev,
            { id: userId, role: 'user', text: question },
            { id: assistantId, role: 'assistant', text: '' },
        ]);

        setThinkingStage('Analyzing your PDFs');
        window.setTimeout(() => setThinkingStage('Generating answer'), 1200);

        try {
            const result = await askPdf.mutateAsync({ question, pdfId: selectedPrimaryPdfId });
            setThinkingStage(null);
            typeAssistantResponse(assistantId, result.answer, result.sources ?? []);
            window.setTimeout(() => responseAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
        } catch {
            setThinkingStage(null);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantId
                        ? { ...msg, text: 'Unable to generate an answer right now. Please try again.' }
                        : msg
                )
            );
        }
    };

    const workspaceLabel = useMemo(
        () =>
            selectedPdfIds.length > 0
                ? `${selectedPdfIds.length} PDF${selectedPdfIds.length > 1 ? 's' : ''} in context`
                : 'No PDFs selected',
        [selectedPdfIds.length]
    );

    return (
        <div className={`${manrope.variable} h-[calc(100vh-2rem)] text-[#E5E7EB]`}>
            <div className="relative grid h-full grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <PdfControlPanel
                    readyPdfs={readyPdfs}
                    selectedPdfIds={selectedPdfIds}
                    onTogglePdf={togglePdf}
                    onRemovePdf={removePdf}
                />

                <section className="relative flex min-h-0 flex-col">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_6%,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_84%_90%,rgba(37,99,235,0.07),transparent_32%)]" />

                    <div className="relative flex items-center justify-between py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Ask PDF Workspace</p>
                        <p className="text-xs text-[#6B7280]">{workspaceLabel}</p>
                    </div>

                    {!hasMessages ? (
                        <div className="relative flex flex-1 flex-col items-center justify-center px-4">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-semibold tracking-tight text-[#E5E7EB]">
                                    Ask anything from your material
                                </h1>
                                <p className="mt-3 text-sm text-[#9CA3AF]">
                                    Frame a direct exam question and get focused answers with citations.
                                </p>
                            </div>
                            <ChatInputBar
                                value={draft}
                                onChange={setDraft}
                                onSubmit={submitQuestion}
                                isLoading={isLoading}
                                selectedModel={model}
                                onSelectedModelChange={setModel}
                                centered
                                disabled={selectedPdfIds.length === 0}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="relative min-h-0 flex-1 overflow-y-auto pr-2">
                                <ChatMessageList messages={messages} thinkingStage={thinkingStage} />
                                <div ref={responseAnchorRef} />
                            </div>
                            <div className="sticky bottom-0 relative border-t border-[#1F2937] bg-gradient-to-t from-[#0B1120] via-[#0B1120]/95 to-transparent px-2 pb-2 pt-4">
                                <ChatInputBar
                                    value={draft}
                                    onChange={setDraft}
                                    onSubmit={submitQuestion}
                                    isLoading={isLoading}
                                    selectedModel={model}
                                    onSelectedModelChange={setModel}
                                    centered={false}
                                    disabled={selectedPdfIds.length === 0}
                                />
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
