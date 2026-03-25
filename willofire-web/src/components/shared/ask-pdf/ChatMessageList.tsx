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
            <span key={`${chunk}-${idx}`} className="rounded bg-[rgba(46,74,98,0.28)] px-1 text-[#B6C8D5]">
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
                        <p className="text-sm text-muted-foreground">{message.text}</p>
                    ) : (
                        <div className="space-y-4 text-[15px] leading-8 text-foreground/90">
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
                                            className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-[#3F6E6A]/55 hover:text-foreground"
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{thinkingStage}</span>
                    <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                    </span>
                </div>
            )}

            {!thinkingStage && messages.length === 0 && (
                <div className={cn('h-px w-full bg-transparent')} />
            )}
        </div>
    );
}
