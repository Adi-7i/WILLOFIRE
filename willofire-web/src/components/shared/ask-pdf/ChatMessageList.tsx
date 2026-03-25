'use client';

import { cn } from '@/lib/utils';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    sources?: number[];
}

interface ChatMessageListProps {
    messages: ChatMessage[];
    thinkingStage: string | null;
}

const keyTerms = ['definition', 'principle', 'concept', 'formula', 'example', 'important', 'conclusion'];

function highlightTerms(text: string) {
    const matcher = new RegExp(`\\b(${keyTerms.join('|')})\\b`, 'gi');
    const chunks = text.split(matcher);

    return chunks.map((chunk, idx) => {
        const isTerm = keyTerms.some((term) => term.toLowerCase() === chunk.toLowerCase());
        if (!isTerm) return <span key={`${chunk}-${idx}`}>{chunk}</span>;
        return (
            <span key={`${chunk}-${idx}`} className="rounded bg-[#1E3A8A]/35 px-1 text-[#BFDBFE]">
                {chunk}
            </span>
        );
    });
}

export function ChatMessageList({ messages, thinkingStage }: ChatMessageListProps) {
    return (
        <div className="mx-auto w-full max-w-4xl space-y-10 pb-16 pt-8">
            {messages.map((message) => (
                <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {message.role === 'user' ? (
                        <p className="text-sm text-[#9CA3AF]">{message.text}</p>
                    ) : (
                        <div className="space-y-4 text-[15px] leading-8 text-[#D1D5DB]">
                            {message.text
                                .split(/\n{2,}/)
                                .filter(Boolean)
                                .map((paragraph, idx) => (
                                    <p key={`${message.id}-p-${idx}`}>{highlightTerms(paragraph)}</p>
                                ))}
                            {message.sources && message.sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {message.sources.map((page, idx) => (
                                        <span
                                            key={`${message.id}-source-${page}-${idx}`}
                                            className="rounded-full border border-[#1F2937] bg-[#0F172A]/70 px-3 py-1 text-xs text-[#9CA3AF] transition-colors hover:border-[#38BDF8]/45 hover:text-[#E5E7EB]"
                                        >
                                            Page {page}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {thinkingStage && (
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <span>{thinkingStage}</span>
                    <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#38BDF8] [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#38BDF8] [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#38BDF8] [animation-delay:240ms]" />
                    </span>
                </div>
            )}

            {!thinkingStage && messages.length === 0 && (
                <div className={cn('h-px w-full bg-transparent')} />
            )}
        </div>
    );
}
