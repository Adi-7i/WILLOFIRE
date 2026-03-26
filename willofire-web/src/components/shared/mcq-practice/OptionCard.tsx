'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

type OptionState = 'default' | 'selected' | 'correct' | 'incorrect';

interface OptionCardProps {
    index: number;
    text: string;
    state: OptionState;
    onSelect: () => void;
    disabled?: boolean;
}

const labelForIndex = (index: number) => String.fromCharCode(65 + index);

export function OptionCard({ index, text, state, onSelect, disabled = false }: OptionCardProps) {
    const showSuccess = state === 'correct';
    const showError = state === 'incorrect';
    const showSelected = state === 'selected';

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            className={cn(
                'w-full min-h-[78px] rounded-2xl border px-5 py-5 text-left transition-all duration-200',
                'hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70',
                state === 'default' && 'border-[#232734] bg-[#151821] hover:border-[#364055] hover:bg-[#181C26]',
                state === 'selected' && 'border-[#4E637E] bg-[#1A1F2A] shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
                state === 'correct' && 'border-[#2F7A68] bg-[#122420]',
                state === 'incorrect' && 'border-[#8A444C] bg-[#2A1517]',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                            state === 'default' && 'border-[#364055] text-[#9AA3B2]',
                            state === 'selected' && 'border-[#6B85A1] bg-[#2E3C50] text-[#E6EAF2]',
                            state === 'correct' && 'border-[#49B39A] bg-[#1F4D42] text-[#7BE0C9]',
                            state === 'incorrect' && 'border-[#CD6F79] bg-[#5C2D32] text-[#E6AAB1]',
                        )}
                    >
                        {labelForIndex(index)}
                    </span>
                    <span className="text-[1.04rem] leading-[1.65] text-[#D9E0EC]">{text}</span>
                </div>

                {(showSuccess || showError || showSelected) && (
                    <span
                        className={cn(
                            'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                            showSuccess && 'bg-[#1F4D42] text-[#7BE0C9]',
                            showError && 'bg-[#5C2D32] text-[#E6AAB1]',
                            showSelected && 'bg-[#2E3C50] text-[#DCE6F7]',
                        )}
                    >
                        {showError ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </span>
                )}
            </div>
        </button>
    );
}
