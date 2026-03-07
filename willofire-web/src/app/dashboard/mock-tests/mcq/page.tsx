'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { McqCard } from '@/components/shared/McqCard';
import { ResultCard } from '@/components/shared/ResultCard';
import { usePdfs } from '@/hooks/use-pdfs';
import { useGenerateMcq, useMcqTests, useSubmitMcq } from '@/hooks/use-mcq';
import { McqQuestion } from '@/types/mcq';

type TestState = 'idle' | 'testing' | 'submitted';

const toUiQuestions = (questions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }>): McqQuestion[] =>
    questions.map((question, index) => ({
        id: `q${index + 1}`,
        question: question.question,
        options: question.options.map((option, optionIndex) => ({
            id: `opt${optionIndex + 1}`,
            text: option,
        })),
        correctOptionId: `opt${question.correctAnswer + 1}`,
        explanation: question.explanation,
    }));

const optionIdToIndex = (optionId: string): number => {
    const numericPart = optionId.replace('opt', '');
    const value = Number(numericPart);
    if (Number.isNaN(value)) return -1;
    return value - 1;
};

export default function MockTestsPage() {
    const [selectedPdfId, setSelectedPdfId] = useState<string>('');
    const [activeTestId, setActiveTestId] = useState<string | null>(null);
    const [testState, setTestState] = useState<TestState>('idle');
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const pdfsQuery = usePdfs();
    const testsQuery = useMcqTests();
    const generateMutation = useGenerateMcq();
    const submitMutation = useSubmitMcq();

    const readyPdfs = (pdfsQuery.data ?? []).filter((pdf) => pdf.status === 'ready');
    const tests = testsQuery.data ?? [];
    const activeTest = tests.find((test) => test.id === activeTestId) ?? tests[0];
    const questions = useMemo(() => toUiQuestions(activeTest?.questions ?? []), [activeTest]);

    const isTestComplete = questions.length > 0 && Object.keys(answers).length === questions.length;

    const handleGenerate = async () => {
        if (!selectedPdfId) return;

        await generateMutation.mutateAsync({
            pdfId: selectedPdfId,
            difficulty: 'medium',
            count: 10,
        });

        await testsQuery.refetch();
    };

    const handleStart = (testId: string) => {
        setActiveTestId(testId);
        setAnswers({});
        setTestState('testing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        if (!activeTest) return;

        const submitAnswers = questions.map((question, index) => ({
            questionIndex: index,
            selectedOption: optionIdToIndex(answers[question.id] ?? 'opt0'),
        }));

        await submitMutation.mutateAsync({
            testId: activeTest.id,
            answers: submitAnswers,
        });

        setTestState('submitted');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelect = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    if (testState === 'submitted' && submitMutation.data) {
        return (
            <div className="pt-4">
                <ResultCard
                    questions={questions}
                    userAnswers={answers}
                    result={submitMutation.data}
                    onRetake={() => {
                        setAnswers({});
                        setTestState('testing');
                    }}
                    onBack={() => {
                        setTestState('idle');
                        setAnswers({});
                    }}
                />
            </div>
        );
    }

    if (testState === 'testing' && activeTest) {
        return (
            <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
                <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{activeTest.title}</h2>
                        <p className="text-sm text-slate-500">Answer all {questions.length} questions to submit</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-0">
                        {Object.keys(answers).length} / {questions.length} Answered
                    </Badge>
                </div>

                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <McqCard
                            key={q.id}
                            question={q}
                            index={index}
                            selectedOptionId={answers[q.id]}
                            onSelect={(optionId) => handleSelect(q.id, optionId)}
                        />
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-600">
                            {isTestComplete ? (
                                <span className="text-green-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    All questions answered
                                </span>
                            ) : (
                                <span>{questions.length - Object.keys(answers).length} questions remaining</span>
                            )}
                        </div>
                        <Button
                            onClick={() => void handleSubmit()}
                            disabled={!isTestComplete || submitMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 h-11"
                        >
                            {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mock Tests</h1>
                <p className="text-slate-500 mt-2">Practice with AI-generated tests from your study materials.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 mb-2">Generate new test from PDF</p>
                    <Select value={selectedPdfId} onValueChange={setSelectedPdfId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a ready PDF" />
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
                <Button
                    onClick={() => void handleGenerate()}
                    disabled={!selectedPdfId || generateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {generateMutation.isPending ? 'Queuing...' : 'Generate Test'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">No tests generated yet</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-[250px]">
                            Upload a PDF, then generate your first AI mock test.
                        </p>
                    </div>
                ) : (
                    tests.map((test) => (
                        <div
                            key={test.id}
                            className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden flex flex-col relative group hover:border-blue-300 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 font-medium shadow-none">Ready</Badge>
                            </div>

                            <div className="p-6 flex-1">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="h-6 w-6" />
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">{test.title}</h3>

                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="h-4 w-4" /> {test.totalQuestions} Questions
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" /> ~{Math.max(5, test.totalQuestions * 2)} mins
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 pt-0 mt-auto">
                                <Button onClick={() => handleStart(test.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                    Start Test
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
