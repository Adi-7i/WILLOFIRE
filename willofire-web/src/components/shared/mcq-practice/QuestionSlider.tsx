'use client';

interface QuestionSliderProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export function QuestionSlider({ value, min = 5, max = 50, onChange, disabled = false }: QuestionSliderProps) {
    return (
        <div className="space-y-3">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2A3040] accent-[#3F6E6A] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Question count"
            />
            <div className="flex items-center justify-between text-xs text-[#9AA3B2]">
                <span>{min} Qns</span>
                <span className="text-[#E6EAF2]">{value} Qns Selected</span>
                <span>{max} Qns</span>
            </div>
        </div>
    );
}
