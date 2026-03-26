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
            <div className="rounded-[24px] border border-border bg-card/55 p-3 backdrop-blur-md transition-all duration-300 focus-within:border-primary wf-soft-glow-focus">
                <Textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Ask anything from your material..."
                    className="min-h-[96px] resize-none border-0 bg-transparent px-2 py-1 text-[15px] leading-7 text-foreground shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            if (canSubmit) onSubmit();
                        }
                    }}
                    disabled={disabled}
                />

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <select
                        value={selectedModel}
                        onChange={(event) => onSelectedModelChange(event.target.value)}
                        className="h-9 min-w-[160px] appearance-none rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground/90 outline-none transition-all duration-300 hover:border-[#3F6E6A]/45 focus:border-primary focus:ring-2 focus:ring-[#3F6E6A]/25"
                    >
                        <option value="exam-assistant-v1">Exam Assistant v1</option>
                        <option value="exam-assistant-pro">Exam Assistant Pro</option>
                    </select>

                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="h-9 rounded-lg wf-accent-gradient px-4 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 wf-soft-glow-hover disabled:opacity-50"
                    >
                        <SendHorizonal className="h-4 w-4" />
                        {isLoading ? 'Analyzing...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
