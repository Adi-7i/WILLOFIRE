'use client';

import { Loader2, RotateCcw, Play, HelpCircle } from 'lucide-react';
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
        <aside className="flex h-screen w-full flex-col border-r border-[#1B2030] bg-[#0B0E16] px-7 py-8 md:sticky md:top-0 md:overflow-y-auto">
            {/* Brand */}
            <div className="mb-10 flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] shadow-[0_0_12px_rgba(63,110,106,0.45)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-[1.2rem] font-semibold tracking-tight text-[#E8EFEE]">Willofire</span>
            </div>

            {/* Content Sections */}
            <div className="flex flex-1 flex-col gap-9">
                {/* PDFs */}
                <section>
                    <p className="mb-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#6B7790]">
                        Active Resources
                    </p>
                    <PDFSelectorList
                        pdfs={readyPdfs}
                        selectedPdfIds={selectedPdfIds}
                        onTogglePdf={onTogglePdf}
                        disabled={isBusy || testStarted}
                    />
                </section>

                {/* Divider */}
                <div className="h-px bg-[#1A2030]" />

                {/* Exam Rigor */}
                <section>
                    <p className="mb-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#6B7790]">
                        Exam Rigor
                    </p>
                    <DifficultySelector
                        options={difficultyOptions}
                        selected={difficulty}
                        onSelect={onDifficultyChange}
                        disabled={isBusy || testStarted}
                    />
                </section>

                {/* Question Depth */}
                <section>
                    <p className="mb-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#6B7790]">
                        Question Depth
                    </p>
                    <QuestionSlider
                        value={questionCount}
                        onChange={onQuestionCountChange}
                        min={5}
                        max={50}
                        disabled={isBusy || testStarted}
                    />
                </section>

                {/* CTA */}
                <button
                    type="button"
                    onClick={onStartOrRestart}
                    disabled={isBusy || selectedPdfIds.length === 0}
                    className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] px-5 text-[14.5px] font-semibold text-[#E8EFF2] shadow-[0_4px_24px_rgba(63,110,106,0.3)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_28px_rgba(63,110,106,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isBusy ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin opacity-80" />
                            Preparing...
                        </>
                    ) : testStarted ? (
                        <>
                            <RotateCcw className="h-4 w-4" />
                            Restart Test
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 fill-current" />
                            Start Assessment
                        </>
                    )}
                </button>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-[#1A2030] pt-6">
                <button
                    type="button"
                    className="flex items-center gap-2 text-[13px] text-[#64748B] transition-colors hover:text-[#9AA3B2]"
                >
                    <HelpCircle className="h-4 w-4" />
                    Exam Support
                </button>
            </div>
        </aside>
    );
}
