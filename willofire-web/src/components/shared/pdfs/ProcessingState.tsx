'use client';

import { BrainCircuit } from 'lucide-react';

interface ProcessingStateProps {
    compact?: boolean;
}

const STEPS = [
    'Extracting content...',
    'Understanding structure...',
    'Preparing for AI interaction...',
];

export function ProcessingState({ compact = false }: ProcessingStateProps) {
    return (
        <div className={compact ? 'flex items-center gap-2 text-[#9AA3B2]' : 'flex items-center gap-3 text-[#9AA3B2]'}>
            <BrainCircuit className={compact ? 'h-4 w-4 text-[#8EB2AE]' : 'h-5 w-5 text-[#8EB2AE]'} />
            <div className={compact ? 'text-xs' : 'text-sm'}>
                <p className="flex items-center gap-2 text-[#E6EAF2]">
                    <span>Processing...</span>
                    <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3F6E6A] animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3F6E6A] animate-pulse [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3F6E6A] animate-pulse [animation-delay:300ms]" />
                    </span>
                </p>
                {!compact && (
                    <div className="mt-1 space-y-0.5">
                        {STEPS.map((step) => (
                            <p key={step} className="text-[#9AA3B2]">
                                {step}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

