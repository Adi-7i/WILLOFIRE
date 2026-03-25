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
import { PdfListItem } from '@/lib/api/types';

interface QuestionPanelProps {
    onAsk: (question: string, pdfId: string) => void;
    isLoading: boolean;
    readyPdfs: PdfListItem[];
}

export function QuestionPanel({ onAsk, isLoading, readyPdfs }: QuestionPanelProps) {
    const [question, setQuestion] = useState('');
    const [selectedPdf, setSelectedPdf] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !selectedPdf || isLoading) return;
        onAsk(question, selectedPdf);
        setQuestion('');
    };

    return (
        <div className="flex flex-col h-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/35 px-6 py-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#89A09D]" />
                    Ask your PDF
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/85">Select Document</label>
                    <Select value={selectedPdf} onValueChange={setSelectedPdf}>
                        <SelectTrigger className="w-full bg-muted/35 border-border">
                            <SelectValue placeholder="Choose a PDF to ask questions about..." />
                        </SelectTrigger>
                        <SelectContent>
                            {readyPdfs.map((pdf) => (
                                <SelectItem key={pdf.id} value={pdf.id}>
                                    {pdf.originalName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-sm font-medium text-foreground/85">Your Question</label>
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g., What are the main principles of thermodynamics mentioned in chapter 4?"
                        className="flex-1 resize-none bg-muted/35 border-border p-4 focus-visible:ring-[#3F6E6A]/30"
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={!question.trim() || !selectedPdf || isLoading || readyPdfs.length === 0}
                    className="w-full h-12 wf-accent-gradient text-primary-foreground font-medium wf-soft-glow-hover"
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
