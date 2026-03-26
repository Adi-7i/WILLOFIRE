'use client';

interface QuestionHeaderProps {
    number: number;
    text: string;
}

export function QuestionHeader({ number, text }: QuestionHeaderProps) {
    return (
        <header className="space-y-5">
            <span className="inline-flex rounded-full bg-[#161C27] px-3.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[#9AA3B2]">
                QUESTION {number.toString().padStart(2, '0')}
            </span>
            <h2 className="max-w-4xl text-[1.95rem] font-medium leading-[1.68] tracking-[0.005em] text-[#E6EAF2] sm:text-[2.2rem]">
                {text}
            </h2>
        </header>
    );
}
