'use client';

import { TimerReset } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
    secondsLeft: number;
}

const formatClock = (seconds: number) => {
    const mm = Math.floor(Math.max(seconds, 0) / 60)
        .toString()
        .padStart(2, '0');
    const ss = (Math.max(seconds, 0) % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
};

export function Timer({ secondsLeft }: TimerProps) {
    return (
        <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9AA3B2]">Time Remaining</p>
            <div className="mt-1.5 flex items-center justify-end gap-2.5 text-[#E6EAF2]">
                <span className="text-[2.1rem] font-medium tracking-[0.04em]">{formatClock(secondsLeft)}</span>
                <span className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2E4A62]/70 bg-[#161C27]",
                    secondsLeft > 0 && secondsLeft < 60 && "animate-soft-ping ring-2 ring-[#3F6E6A]/50 border-[#3F6E6A]"
                )}>
                    <TimerReset className={cn("h-4 w-4", secondsLeft > 0 && secondsLeft < 60 ? "text-[#E6EAF2]" : "text-[#5BC9B8]")} />
                </span>
            </div>
        </div>
    );
}
