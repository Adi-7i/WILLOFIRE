'use client';

import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    selectedModel: string;
    onSelectedModelChange: (value: string) => void;
    centered: boolean;
    disabled?: boolean;
}

export function ChatInputBar({
    value,
    onChange,
    onSubmit,
    isLoading,
    selectedModel,
    onSelectedModelChange,
    centered,
    disabled = false,
}: ChatInputBarProps) {
    const canSubmit = value.trim().length > 0 && !isLoading && !disabled;

    return (
        <div className={centered ? 'mx-auto w-full max-w-4xl' : 'w-full'}>
            <div className="rounded-[24px] border border-[#1F2937] bg-[#0F172A]/55 p-3 backdrop-blur-md transition-all duration-300 focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_1px_rgba(37,99,235,0.45)]">
                <Textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Ask anything from your material..."
                    className="min-h-[96px] resize-none border-0 bg-transparent px-2 py-1 text-[15px] leading-7 text-[#E5E7EB] shadow-none placeholder:text-[#6B7280] focus-visible:ring-0"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            if (canSubmit) onSubmit();
                        }
                    }}
                    disabled={disabled}
                />

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#1F2937] pt-3">
                    <select
                        value={selectedModel}
                        onChange={(event) => onSelectedModelChange(event.target.value)}
                        className="h-9 min-w-[160px] appearance-none rounded-lg border border-[#1F2937] bg-[#0B1120]/80 px-3 text-sm text-[#D1D5DB] outline-none transition-all duration-300 hover:border-[#334155] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/30"
                    >
                        <option value="exam-assistant-v1">Exam Assistant v1</option>
                        <option value="exam-assistant-pro">Exam Assistant Pro</option>
                    </select>

                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="h-9 rounded-lg bg-[#2563EB] px-4 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1D4ED8] disabled:opacity-50"
                    >
                        <SendHorizonal className="h-4 w-4" />
                        {isLoading ? 'Working...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
