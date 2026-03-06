'use client';

import { useState } from 'react';
import { QuestionPanel } from '@/components/shared/QuestionPanel';
import { AnswerPanel } from '@/components/shared/AnswerPanel';

export default function AskPdfPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

    const handleAskQuestion = (question: string, pdfId: string) => {
        setIsLoading(true);
        setHasAnswered(false);

        // Simulate API call to AI service
        setTimeout(() => {
            setCurrentAnswer(
                "Thermodynamics is the branch of physics that deals with the relationships between heat and other forms of energy. In particular, it describes how thermal energy is converted to and from other forms of energy and how it affects matter.\n\nThe fundamental principles are expressed in four laws that postulate that energy can be exchanged between physical systems as heat or work. They also postulate the existence of a quantity named entropy, which can be defined for any system."
            );
            setIsLoading(false);
            setHasAnswered(true);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Ask PDF
                </h1>
                <p className="text-slate-500 mt-2">
                    Chat with your study materials using our AI tutor.
                </p>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Question Input */}
                <div className="lg:col-span-4 lg:col-start-1 h-full">
                    <QuestionPanel onAsk={handleAskQuestion} isLoading={isLoading} />
                </div>

                {/* Right Column - Answer Display */}
                <div className="lg:col-span-8 lg:col-start-5 h-full">
                    <AnswerPanel
                        answer={currentAnswer}
                        isLoading={isLoading}
                        hasAnswered={hasAnswered}
                    />
                </div>
            </div>
        </div>
    );
}
