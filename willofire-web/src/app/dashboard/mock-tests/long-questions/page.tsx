'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, FileText } from 'lucide-react';
import { usePdfs } from '@/hooks/use-pdfs';
import { LongQuestionCard } from '@/components/shared/LongQuestionCard';

const DUMMY_QUESTIONS = [
    { id: 'q1', text: 'Explain the significance of Directive Principles in governance. How do they complement Fundamental Rights?', marks: 10 },
    { id: 'q2', text: 'Analyze the impact of climate change on coastal agriculture in developing nations. Discuss potential mitigation strategies.', marks: 15 },
    { id: 'q3', text: 'What are the primary causes of inflation in a growing economy? Illustrate with recent examples.', marks: 10 },
    { id: 'q4', text: 'Describe the architecture of a modern neural network. Why is backpropagation essential for its training?', marks: 5 },
    { id: 'q5', text: 'Discuss the role of international organizations in maintaining global peace and security post-WWII.', marks: 10 },
];

export default function LongQuestionPracticePage() {
    const [selectedPdfId, setSelectedPdfId] = useState<string>('');
    const [questionCount, setQuestionCount] = useState<string>('5');
    const [marks, setMarks] = useState<string>('10');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<typeof DUMMY_QUESTIONS | null>(null);

    const pdfsQuery = usePdfs();
    const readyPdfs = (pdfsQuery.data ?? []).filter((pdf) => pdf.status === 'ready');

    const handleGenerate = () => {
        if (!selectedPdfId) return;

        setIsGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            const count = parseInt(questionCount, 10);
            const selectedMarks = parseInt(marks, 10);

            // Generate dummy questions based on selection
            const questions = DUMMY_QUESTIONS.slice(0, count).map(q => ({
                ...q,
                marks: selectedMarks
            }));

            setGeneratedQuestions(questions);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Long Question Practice</h1>
                <p className="text-slate-500 mt-2">Generate subjective questions to practice comprehensive answers.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-4 md:items-end">
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Source Material</label>
                        <Select value={selectedPdfId} onValueChange={setSelectedPdfId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a PDF" />
                            </SelectTrigger>
                            <SelectContent>
                                {readyPdfs.map((pdf) => (
                                    <SelectItem key={pdf.id} value={pdf.id}>
                                        {pdf.originalName}
                                    </SelectItem>
                                ))}
                                {readyPdfs.length === 0 && (
                                    <SelectItem value="none" disabled>
                                        No ready PDFs available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Questions</label>
                        <Select value={questionCount} onValueChange={setQuestionCount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Count" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 questions</SelectItem>
                                <SelectItem value="5">5 questions</SelectItem>
                                <SelectItem value="10">10 questions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Marks per question</label>
                        <Select value={marks} onValueChange={setMarks}>
                            <SelectTrigger>
                                <SelectValue placeholder="Marks" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 marks</SelectItem>
                                <SelectItem value="10">10 marks</SelectItem>
                                <SelectItem value="15">15 marks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <Button
                            onClick={handleGenerate}
                            disabled={!selectedPdfId || isGenerating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Questions'}
                        </Button>
                    </div>
                </div>
            </div>

            {generatedQuestions ? (
                <div className="space-y-6 pt-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">Practice Set</h2>
                        <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {generatedQuestions.length} questions • {generatedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks total
                        </span>
                    </div>

                    <div className="space-y-6">
                        {generatedQuestions.map((q, index) => (
                            <LongQuestionCard
                                key={`${q.id}-${index}`}
                                index={index}
                                question={q.text}
                                marks={q.marks}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Ready to practice</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-[300px]">
                        Select a PDF, configure the format, and generate long-form questions to test your understanding.
                    </p>
                </div>
            )}
        </div>
    );
}
