'use client';

import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DUMMY_PDFS } from '@/types/pdf';

interface QuestionPanelProps {
    onAsk: (question: string, pdfId: string) => void;
    isLoading: boolean;
}

export function QuestionPanel({ onAsk, isLoading }: QuestionPanelProps) {
    const [question, setQuestion] = useState('');
    const [selectedPdf, setSelectedPdf] = useState<string>('');

    const readyPdfs = DUMMY_PDFS.filter((p) => p.status === 'ready');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !selectedPdf || isLoading) return;
        onAsk(question, selectedPdf);
        setQuestion('');
    };

    return (
        <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Ask your PDF
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Select Document</label>
                    <Select value={selectedPdf} onValueChange={setSelectedPdf}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Choose a PDF to ask questions about..." />
                        </SelectTrigger>
                        <SelectContent>
                            {readyPdfs.map((pdf) => (
                                <SelectItem key={pdf.id} value={pdf.id}>
                                    {pdf.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-sm font-medium text-slate-700">Your Question</label>
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g., What are the main principles of thermodynamics mentioned in chapter 4?"
                        className="flex-1 resize-none bg-slate-50 border-slate-200 p-4 focus-visible:ring-blue-500"
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={!question.trim() || !selectedPdf || isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 animate-pulse" /> Thinking...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" /> Ask AI
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
}
