'use client';

import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationControlsProps {
    isFirst: boolean;
    isLast: boolean;
    flagged: boolean;
    disabled?: boolean;
    onPrevious: () => void;
    onToggleFlag: () => void;
    onNext: () => void;
}

export function NavigationControls({
    isFirst,
    isLast,
    flagged,
    disabled = false,
    onPrevious,
    onToggleFlag,
    onNext,
}: NavigationControlsProps) {
    return (
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-[#232734] pt-8 pb-4">
            <button
                type="button"
                onClick={onPrevious}
                disabled={isFirst || disabled}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-[#C5CEDA] transition-colors duration-200 hover:bg-[#1A1F2A] disabled:cursor-not-allowed disabled:opacity-45"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </button>

            <button
                type="button"
                onClick={onToggleFlag}
                disabled={disabled}
                className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition-all duration-200',
                    flagged
                        ? 'border-[#3D475B] bg-[#1A1F2A] text-[#E6EAF2]'
                        : 'border-[#232734] bg-[#151821] text-[#9AA3B2] hover:border-[#364055] hover:text-[#D7DFEA]',
                    disabled && 'cursor-not-allowed opacity-60',
                )}
            >
                <Flag className={cn('h-4 w-4', flagged && 'fill-current')} />
                Flag for Review
            </button>

            <button
                type="button"
                onClick={onNext}
                disabled={disabled}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2E4A62,#3F6E6A)] px-6 text-sm font-medium text-[#E6EAF2] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLast ? 'Submit Test' : 'Next Question'}
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
