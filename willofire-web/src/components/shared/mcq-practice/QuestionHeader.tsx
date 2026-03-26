'use client';

interface QuestionHeaderProps {
    number: number;
    text: string;
}

export function QuestionHeader({ number, text }: QuestionHeaderProps) {
    return (
        <header className="space-y-6">
            <span className="inline-flex rounded-full border border-[#2A3341] bg-[#161C27] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9AA3B2]">
                QUESTION {number.toString().padStart(2, '0')}
            </span>
            <h2 className="max-w-[900px] text-[2.1rem] font-medium leading-[1.65] tracking-[0.01em] text-[#E6EAF2] sm:text-[2.25rem]">
                {text}
            </h2>
        </header>
    );
}
