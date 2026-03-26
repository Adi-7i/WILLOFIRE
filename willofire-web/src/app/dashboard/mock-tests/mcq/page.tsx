'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfs } from '@/hooks/use-pdfs';
import { useGenerateMcq, useMcqTests, useSubmitMcq } from '@/hooks/use-mcq';
import { ControlPanel } from '@/components/shared/mcq-practice/ControlPanel';
import { NavigationControls } from '@/components/shared/mcq-practice/NavigationControls';
import { OptionCard } from '@/components/shared/mcq-practice/OptionCard';
import { ProgressBar } from '@/components/shared/mcq-practice/ProgressBar';
import { QuestionHeader } from '@/components/shared/mcq-practice/QuestionHeader';
import { Timer } from '@/components/shared/mcq-practice/Timer';
import { DifficultyValue } from '@/components/shared/mcq-practice/DifficultySelector';

const TEST_MINUTES_PER_QUESTION = 2;

const getSessionDurationSeconds = (questionCount: number) => questionCount * TEST_MINUTES_PER_QUESTION * 60;

export default function McqPracticePage() {
    const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<DifficultyValue>('medium');
    const [questionCount, setQuestionCount] = useState<number>(10);
    const [activeTestId, setActiveTestId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
    const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
    const [testStarted, setTestStarted] = useState<boolean>(false);
    const [awaitingGeneratedTest, setAwaitingGeneratedTest] = useState<boolean>(false);
    const [generationRequest, setGenerationRequest] = useState<{ pdfId: string; requestedAt: number } | null>(null);

    const pdfsQuery = usePdfs();
    const testsQuery = useMcqTests();
    const generateMutation = useGenerateMcq();
    const submitMutation = useSubmitMcq();

    const readyPdfs = useMemo(
        () => (pdfsQuery.data ?? []).filter((pdf) => pdf.status === 'ready'),
        [pdfsQuery.data],
    );

    const tests = useMemo(() => {
        const items = testsQuery.data ?? [];
        return [...items].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }, [testsQuery.data]);

    useEffect(() => {
        if (readyPdfs.length === 0) {
            setSelectedPdfIds([]);
            return;
        }

        setSelectedPdfIds((current) => {
            const validIds = current.filter((id) => readyPdfs.some((pdf) => pdf.id === id));
            if (validIds.length > 0) return validIds;
            return [readyPdfs[0].id];
        });
    }, [readyPdfs]);

    const activeTest = useMemo(
        () => tests.find((test) => test.id === activeTestId) ?? null,
        [tests, activeTestId],
    );

    const questions = activeTest?.questions ?? [];
    const currentQuestion = questions[currentQuestionIndex];

    const isSubmitting = submitMutation.isPending;
    const isControlBusy = awaitingGeneratedTest || generateMutation.isPending || isSubmitting;
    const answeredCount = Object.keys(selectedAnswers).length;
    const isCurrentFlagged = flaggedQuestions.includes(currentQuestionIndex);
    const selectedOptionIndex = selectedAnswers[currentQuestionIndex];
    const totalQuestions = activeTest?.totalQuestions ?? 0;

    const initializeTestSession = useCallback(
        (testId: string, totalQuestions: number) => {
            setActiveTestId(testId);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setFlaggedQuestions([]);
            setTimerSecondsLeft(getSessionDurationSeconds(totalQuestions));
            setTestStarted(true);
            submitMutation.reset();
        },
        [submitMutation],
    );

    useEffect(() => {
        if (!awaitingGeneratedTest || !generationRequest) return;

        const generatedTest = tests.find(
            (test) =>
                test.pdfId === generationRequest.pdfId &&
                new Date(test.createdAt).getTime() >= generationRequest.requestedAt - 3000,
        );

        if (!generatedTest) return;

        setAwaitingGeneratedTest(false);
        setGenerationRequest(null);
        initializeTestSession(generatedTest.id, generatedTest.totalQuestions);
    }, [awaitingGeneratedTest, generationRequest, initializeTestSession, tests]);

    const handleSubmit = useCallback(async () => {
        if (!activeTest || isSubmitting) return;

        const answers = activeTest.questions.map((_, index) => ({
            questionIndex: index,
            selectedOption: selectedAnswers[index] ?? -1,
        }));

        await submitMutation.mutateAsync({ testId: activeTest.id, answers });
    }, [activeTest, isSubmitting, selectedAnswers, submitMutation]);

    useEffect(() => {
        if (!testStarted || !activeTest || submitMutation.isSuccess) return;

        const intervalId = window.setInterval(() => {
            setTimerSecondsLeft((previous) => (previous <= 0 ? 0 : previous - 1));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [activeTest, submitMutation.isSuccess, testStarted]);

    useEffect(() => {
        if (!testStarted || !activeTest || submitMutation.isSuccess || timerSecondsLeft > 0) return;
        void handleSubmit();
    }, [activeTest, handleSubmit, submitMutation.isSuccess, testStarted, timerSecondsLeft]);

    const handleTogglePdf = (pdfId: string) => {
        if (testStarted || isControlBusy) return;
        setSelectedPdfIds((current) =>
            current.includes(pdfId) ? current.filter((id) => id !== pdfId) : [...current, pdfId],
        );
    };

    const handleStartOrRestart = async () => {
        if (testStarted && activeTest) {
            initializeTestSession(activeTest.id, activeTest.totalQuestions);
            return;
        }

        if (selectedPdfIds.length === 0) return;

        const primaryPdfId = selectedPdfIds[0];

        const existingTest = tests.find(
            (test) => test.pdfId === primaryPdfId && test.totalQuestions === questionCount,
        );

        if (existingTest) {
            initializeTestSession(existingTest.id, existingTest.totalQuestions);
            return;
        }

        setAwaitingGeneratedTest(true);
        setGenerationRequest({ pdfId: primaryPdfId, requestedAt: Date.now() });

        try {
            await generateMutation.mutateAsync({
                pdfId: primaryPdfId,
                difficulty,
                count: questionCount,
            });
            await testsQuery.refetch();
        } catch {
            setAwaitingGeneratedTest(false);
            setGenerationRequest(null);
        }
    };

    const handleSelectOption = (optionIndex: number) => {
        if (!testStarted || submitMutation.isSuccess) return;
        setSelectedAnswers((current) => ({ ...current, [currentQuestionIndex]: optionIndex }));
    };

    const handlePrevious = () => {
        setCurrentQuestionIndex((current) => Math.max(0, current - 1));
    };

    const handleNext = () => {
        if (!activeTest) return;

        if (currentQuestionIndex >= activeTest.totalQuestions - 1) {
            void handleSubmit();
            return;
        }

        setCurrentQuestionIndex((current) => Math.min(activeTest.totalQuestions - 1, current + 1));
    };

    const handleToggleFlag = () => {
        setFlaggedQuestions((current) =>
            current.includes(currentQuestionIndex)
                ? current.filter((value) => value !== currentQuestionIndex)
                : [...current, currentQuestionIndex],
        );
    };

    const loadingExam = awaitingGeneratedTest || (testsQuery.isLoading && !activeTest);
    const hasQuestionContent = Boolean(testStarted && currentQuestion && activeTest);

    return (
        <div className="min-h-[calc(100vh-8.5rem)] grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)] animate-in fade-in duration-300">
            <ControlPanel
                readyPdfs={readyPdfs}
                selectedPdfIds={selectedPdfIds}
                difficulty={difficulty}
                questionCount={questionCount}
                testStarted={testStarted}
                isBusy={isControlBusy}
                onTogglePdf={handleTogglePdf}
                onDifficultyChange={setDifficulty}
                onQuestionCountChange={setQuestionCount}
                onStartOrRestart={() => void handleStartOrRestart()}
            />

            <section className="relative px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
                {loadingExam ? (
                    <div className="w-full space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="h-8 w-72 animate-pulse rounded bg-[#1E2432]" />
                            <div className="h-10 w-28 animate-pulse rounded-full bg-[#1E2432]" />
                        </div>
                        <div className="h-1.5 w-full animate-pulse rounded bg-[#1E2432]" />
                        <div className="h-24 w-[88%] animate-pulse rounded bg-[#1E2432]" />
                        <div className="space-y-4">
                            <div className="h-24 w-full animate-pulse rounded-3xl bg-[#1E2432]" />
                            <div className="h-24 w-full animate-pulse rounded-3xl bg-[#1E2432]" />
                            <div className="h-24 w-full animate-pulse rounded-3xl bg-[#1E2432]" />
                            <div className="h-24 w-full animate-pulse rounded-3xl bg-[#1E2432]" />
                        </div>
                    </div>
                ) : !hasQuestionContent ? (
                    <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
                        <p className="text-xl font-medium text-[#E6EAF2]">No questions available</p>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#9AA3B2]">
                            Configure your source PDFs and assessment settings from the control panel to start a test.
                        </p>
                        <button
                            type="button"
                            onClick={() => void handleStartOrRestart()}
                            disabled={isControlBusy || selectedPdfIds.length === 0}
                            className="mt-6 inline-flex h-11 items-center rounded-full bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] px-6 text-sm font-medium text-[#E6EAF2] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Start a test
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-9">
                        <div className="space-y-4 border-b border-[#232734] pb-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="space-y-1.5">
                                    <p className="text-[11px] uppercase tracking-[0.13em] text-[#9AA3B2]">Progress Tracking</p>
                                    <p className="text-[1.02rem] text-[#E6EAF2]">
                                        {answeredCount} of {totalQuestions} questions completed
                                    </p>
                                </div>
                                <Timer secondsLeft={timerSecondsLeft} />
                            </div>
                            <ProgressBar currentCompleted={answeredCount} total={totalQuestions} />
                        </div>

                        {submitMutation.isSuccess && (
                            <div className="border-l-2 border-[#3F6E6A] bg-[rgba(46,109,95,0.1)] px-4 py-3 text-sm text-[#CCE8E0]">
                                Score: {submitMutation.data.score}% ({submitMutation.data.correct}/{submitMutation.data.totalQuestions} correct)
                            </div>
                        )}

                        <QuestionHeader number={currentQuestionIndex + 1} text={currentQuestion.question} />

                        <div className="space-y-3">
                            {currentQuestion.options.map((optionText, optionIndex) => {
                                let state: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
                                const correctOptionIndex =
                                    submitMutation.data?.results[currentQuestionIndex]?.correctAnswer ?? currentQuestion.correctAnswer;

                                if (!submitMutation.isSuccess && selectedOptionIndex !== undefined) {
                                    state = optionIndex === selectedOptionIndex ? 'selected' : 'default';
                                }

                                if (submitMutation.isSuccess && selectedOptionIndex !== undefined) {
                                    if (optionIndex === correctOptionIndex) state = 'correct';
                                    else if (optionIndex === selectedOptionIndex) state = 'incorrect';
                                }

                                return (
                                    <OptionCard
                                        key={`${currentQuestionIndex}-${optionIndex}`}
                                        index={optionIndex}
                                        text={optionText}
                                        state={state}
                                        onSelect={() => handleSelectOption(optionIndex)}
                                        disabled={submitMutation.isSuccess}
                                    />
                                );
                            })}
                        </div>

                        <NavigationControls
                            isFirst={currentQuestionIndex === 0}
                            isLast={currentQuestionIndex === totalQuestions - 1}
                            flagged={isCurrentFlagged}
                            disabled={isSubmitting}
                            onPrevious={handlePrevious}
                            onToggleFlag={handleToggleFlag}
                            onNext={handleNext}
                        />

                        {generateMutation.isError && !testStarted && (
                            <p className="text-sm text-red-300">Unable to start assessment. Please try again.</p>
                        )}
                    </div>
                )}

                {awaitingGeneratedTest && (
                    <div className="mt-6 flex w-full items-center gap-2 text-sm text-[#9AA3B2]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating your assessment from selected material...
                    </div>
                )}
            </section>
        </div>
    );
}
