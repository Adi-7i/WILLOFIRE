'use client';

import { cn } from '@/lib/utils';

export type DifficultyValue = 'easy' | 'medium' | 'hard';

interface DifficultyOption {
    label: string;
    value: DifficultyValue;
}

interface DifficultySelectorProps {
    options: DifficultyOption[];
    selected: DifficultyValue;
    onSelect: (value: DifficultyValue) => void;
    disabled?: boolean;
}

export function DifficultySelector({ options, selected, onSelect, disabled = false }: DifficultySelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-2.5">
            {options.map((option) => {
                const isActive = option.value === selected;

                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(option.value)}
                        className={cn(
                            'rounded-full border px-3 py-2 text-[13px] transition-all duration-200',
                            isActive
                                ? 'border-[#3F6E6A] bg-[rgba(63,110,106,0.22)] text-[#E6EAF2] shadow-[0_0_0_1px_rgba(63,110,106,0.2)]'
                                : 'border-[#2A3040] bg-transparent text-[#9AA3B2] hover:border-[#394356] hover:text-[#D4DBE5]',
                            disabled && 'cursor-not-allowed opacity-65',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
