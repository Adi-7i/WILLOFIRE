'use client';

import { Loader2, RotateCcw, Play } from 'lucide-react';
import { PdfListItem } from '@/lib/api/types';
import { DifficultySelector, DifficultyValue } from './DifficultySelector';
import { PDFSelectorList } from './PDFSelectorList';
import { QuestionSlider } from './QuestionSlider';

interface ControlPanelProps {
    readyPdfs: PdfListItem[];
    selectedPdfIds: string[];
    difficulty: DifficultyValue;
    questionCount: number;
    testStarted: boolean;
    isBusy: boolean;
    onTogglePdf: (pdfId: string) => void;
    onDifficultyChange: (value: DifficultyValue) => void;
    onQuestionCountChange: (value: number) => void;
    onStartOrRestart: () => void;
}

const difficultyOptions = [
    { label: 'Standard', value: 'easy' as const },
    { label: 'Scholarly', value: 'medium' as const },
    { label: 'Elite', value: 'hard' as const },
];

export function ControlPanel({
    readyPdfs,
    selectedPdfIds,
    difficulty,
    questionCount,
    testStarted,
    isBusy,
    onTogglePdf,
    onDifficultyChange,
    onQuestionCountChange,
    onStartOrRestart,
}: ControlPanelProps) {
    return (
        <aside className="h-full border-r border-[#232734] bg-[#0F141B] px-6 py-6 md:sticky md:top-20 md:min-h-[calc(100vh-5rem)]">
            <div className="space-y-8">
                <section>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9AA3B2]">Selected PDFs</p>
                    <div className="mt-3.5">
                        <PDFSelectorList
                            pdfs={readyPdfs}
                            selectedPdfIds={selectedPdfIds}
                            onTogglePdf={onTogglePdf}
                            disabled={isBusy || testStarted}
                        />
                    </div>
                </section>

                <section>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9AA3B2]">Exam Rigor</p>
                    <div className="mt-3.5">
                        <DifficultySelector
                            options={difficultyOptions}
                            selected={difficulty}
                            onSelect={onDifficultyChange}
                            disabled={isBusy || testStarted}
                        />
                    </div>
                </section>

                <section>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9AA3B2]">Question Depth</p>
                    <div className="mt-3.5">
                        <QuestionSlider
                            value={questionCount}
                            onChange={onQuestionCountChange}
                            min={5}
                            max={50}
                            disabled={isBusy || testStarted}
                        />
                    </div>
                </section>

                <button
                    type="button"
                    onClick={onStartOrRestart}
                    disabled={isBusy || selectedPdfIds.length === 0}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] px-5 text-[15px] font-medium text-[#E6EAF2] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isBusy ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparing...
                        </>
                    ) : testStarted ? (
                        <>
                            <RotateCcw className="h-4 w-4" />
                            Restart Test
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            Start Assessment
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
