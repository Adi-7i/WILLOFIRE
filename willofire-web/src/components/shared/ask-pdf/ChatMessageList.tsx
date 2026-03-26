'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

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

// Strips raw markdown that might slip through
function cleanText(text: string) {
    return text.replace(/(\*\*|__|\*|#)/g, '');
}

function highlightTerms(text: string) {
    const matcher = new RegExp(`\\b(${keyTerms.join('|')})\\b`, 'gi');
    const chunks = text.split(matcher);

    return chunks.map((chunk, idx) => {
        const isTerm = keyTerms.some((term) => term.toLowerCase() === chunk.toLowerCase());
        if (!isTerm) return <span key={`${chunk}-${idx}`}>{chunk}</span>;
        return (
            <span key={`${chunk}-${idx}`} className="rounded bg-[rgba(46,74,98,0.28)] px-1 text-[#4BB3A8] font-medium">
                {chunk}
            </span>
        );
    });
}

function renderAiContent(text: string, messageId: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let currentParagraph: string[] = [];

    const commitParagraph = () => {
        if (currentParagraph.length > 0) {
            elements.push(
                <p key={`p-${elements.length}`} className="mb-4 leading-relaxed text-[#E6EAF2]">
                    {highlightTerms(cleanText(currentParagraph.join(' ')))}
                </p>
            );
            currentParagraph = [];
        }
    };

    const commitList = () => {
        if (currentList) {
            const ListTag = currentList.type;
            elements.push(
                <ListTag
                    key={`list-${elements.length}`}
                    className={cn('mb-4 space-y-2 pl-5 text-[#E6EAF2]', currentList.type === 'ul' ? 'list-disc' : 'list-decimal')}
                >
                    {currentList.items.map((item, i) => (
                        <li key={`li-${i}`} className="leading-relaxed pl-1">
                            {highlightTerms(cleanText(item))}
                        </li>
                    ))}
                </ListTag>
            );
            currentList = null;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            commitParagraph();
            commitList();
            continue;
        }

        // Detect Headings (e.g., "Overview:", "KEY POINTS")
        const isHeading = /^[A-Z][^a-z]{0,40}:$/.test(line) || (/^[A-Z\s]+$/.test(cleanText(line)) && line.length > 3 && line.length < 40);

        if (isHeading) {
            commitParagraph();
            commitList();
            elements.push(
                <h3 key={`h3-${elements.length}`} className="mt-6 mb-3 text-lg font-semibold tracking-tight text-white">
                    {cleanText(line).replace(':', '')}
                </h3>
            );
            continue;
        }

        // Detect Bullet Points
        const isBullet = line.startsWith('- ') || line.startsWith('• ');
        if (isBullet) {
            commitParagraph();
            if (!currentList || currentList.type !== 'ul') {
                commitList();
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(line.substring(2).trim());
            continue;
        }

        // Detect Numbered Lists
        const isNumbered = /^\d+\.\s/.test(line);
        if (isNumbered) {
            commitParagraph();
            if (!currentList || currentList.type !== 'ol') {
                commitList();
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(line.replace(/^\d+\.\s/, '').trim());
            continue;
        }

        // Regular text
        commitList();
        currentParagraph.push(line);
    }

    commitParagraph();
    commitList();

    return <div className="text-[15px]">{elements}</div>;
}

export function ChatMessageList({ messages, thinkingStage }: ChatMessageListProps) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, thinkingStage]);

    return (
        <div ref={listRef} className="mx-auto w-full max-w-4xl space-y-8 pb-32 pt-8 px-4 h-full overflow-y-auto scroll-smooth no-scrollbar">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        'flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.role === 'user' ? (
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#1E2532] px-5 py-3.5 text-[15px] text-[#E6EAF2] shadow-sm ring-1 ring-white/5">
                            {message.text}
                        </div>
                    ) : (
                        <div className="flex w-full max-w-[90%] gap-4">
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-4 pt-1 text-foreground/90">
                                {renderAiContent(message.text, message.id)}
                                
                                {message.sources && message.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                        <span className="text-xs text-muted-foreground/70 py-1 uppercase tracking-wider font-medium">Sources:</span>
                                        {message.sources.map((page, idx) => (
                                            <span
                                                key={`${message.id}-source-${page}-${idx}`}
                                                className="rounded-md border border-border/50 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-[#3F6E6A]/55 hover:text-foreground cursor-default"
                                            >
                                                Page {page}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {thinkingStage && (
                <div className="flex w-full justify-start animate-in fade-in duration-300">
                     <div className="flex max-w-[90%] gap-4">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                            <Bot className="h-4 w-4 text-primary/70" />
                        </div>
                        <div className="flex items-center gap-2 pt-2.5 text-sm text-[#9AA3B2]">
                            <span className="font-medium animate-pulse">Analyzing your material</span>
                            <span className="inline-flex gap-1.5 ml-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4BB3A8]/70 [animation-delay:-0.3s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4BB3A8]/70 [animation-delay:-0.15s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4BB3A8]/70" />
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {!thinkingStage && messages.length === 0 && (
                <div className="flex h-[40vh] flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-700">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E2532] ring-1 ring-white/5">
                        <Bot className="h-8 w-8 text-[#4BB3A8]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Your AI Study Assistant</h3>
                        <p className="max-w-sm text-sm text-[#9AA3B2]">
                            Ask questions, request summaries, or clarify concepts from your selected study materials.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
