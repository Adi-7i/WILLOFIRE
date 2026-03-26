'use client';

interface ProgressBarProps {
    currentCompleted: number;
    total: number;
}

export function ProgressBar({ currentCompleted, total }: ProgressBarProps) {
    const progress = total > 0 ? Math.min(100, Math.round((currentCompleted / total) * 100)) : 0;

    return (
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#2B3243]">
            <div
                className="h-full rounded-full bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
