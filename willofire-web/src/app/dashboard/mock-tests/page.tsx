'use client';

import { useState } from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { McqCard } from '@/components/shared/McqCard';
import { ResultCard } from '@/components/shared/ResultCard';
import { DUMMY_TEST_QUESTIONS } from '@/types/mcq';

type TestState = 'idle' | 'testing' | 'submitted';

export default function MockTestsPage() {
    const [testState, setTestState] = useState<TestState>('idle');
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const isTestComplete = Object.keys(answers).length === DUMMY_TEST_QUESTIONS.length;

    const handleStart = () => {
        setAnswers({});
        setTestState('testing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = () => {
        setTestState('submitted');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelect = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    if (testState === 'submitted') {
        return (
            <div className="pt-4">
                <ResultCard
                    questions={DUMMY_TEST_QUESTIONS}
                    userAnswers={answers}
                    onRetake={handleStart}
                />
            </div>
        );
    }

    if (testState === 'testing') {
        return (
            <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
                <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Thermodynamics Mock Test</h2>
                        <p className="text-sm text-slate-500">
                            Answer all {DUMMY_TEST_QUESTIONS.length} questions to submit
                        </p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-0">
                        {Object.keys(answers).length} / {DUMMY_TEST_QUESTIONS.length} Answered
                    </Badge>
                </div>

                <div className="space-y-6">
                    {DUMMY_TEST_QUESTIONS.map((q, index) => (
                        <McqCard
                            key={q.id}
                            question={q}
                            index={index}
                            selectedOptionId={answers[q.id]}
                            onSelect={(optionId) => handleSelect(q.id, optionId)}
                        />
                    ))}
                </div>

                {/* Floating action bar */}
                <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-600">
                            {isTestComplete ? (
                                <span className="text-green-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    All questions answered
                                </span>
                            ) : (
                                <span>
                                    {DUMMY_TEST_QUESTIONS.length - Object.keys(answers).length} questions remaining
                                </span>
                            )}
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isTestComplete}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 h-11"
                        >
                            Submit Test
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Mock Tests
                </h1>
                <p className="text-slate-500 mt-2">
                    Practice with AI-generated tests from your study materials.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Active Test Card */}
                <div className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden flex flex-col relative group hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 font-medium shadow-none">
                            New
                        </Badge>
                    </div>

                    <div className="p-6 flex-1">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            Thermodynamics & Heat Transfer
                        </h3>

                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 mb-6">
                            <span className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4" /> 3 Questions
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" /> ~5 mins
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2">
                            Based on Chapter 4 Thermodynamics. Covers extensive vs intensive properties, ideal gas law, and first law of thermodynamics.
                        </p>
                    </div>

                    <div className="p-6 pt-0 mt-auto">
                        <Button onClick={handleStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                            Start Test
                        </Button>
                    </div>
                </div>

                {/* Placeholder Card */}
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Generate New Test</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-[200px]">
                        Go to My PDFs to generate a new mock test from your materials.
                    </p>
                </div>
            </div>
        </div>
    );
}
