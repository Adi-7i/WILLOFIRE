'use client';

import { TimerReset } from 'lucide-react';

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
            <p className="text-[11px] uppercase tracking-[0.13em] text-[#9AA3B2]">Time Remaining</p>
            <div className="mt-1.5 flex items-center justify-end gap-2 text-[#E6EAF2]">
                <span className="text-[2rem] font-medium tracking-[0.04em]">{formatClock(secondsLeft)}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2E4A62]/70 bg-[rgba(46,74,98,0.16)]">
                    <TimerReset className="h-4 w-4 text-[#64D7C7]" />
                </span>
            </div>
        </div>
    );
}
