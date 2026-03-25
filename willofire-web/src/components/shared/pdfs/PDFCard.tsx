'use client';

import Link from 'next/link';
import { CalendarDays, FileText, Layers3, MessageSquareText, NotebookPen, TestTube2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfListItem } from '@/lib/api/types';
import { ProcessingState } from '@/components/shared/pdfs/ProcessingState';

interface PDFCardProps {
    pdf: PdfListItem;
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

export function PDFCard({ pdf }: PDFCardProps) {
    const isReady = pdf.status === 'ready';
    const actionClass = [
        'inline-flex h-8 items-center justify-start gap-2 rounded-md border border-[#2A3040] bg-[#171D2A] px-3 text-xs font-medium text-[#C4CCD9] transition-colors',
        'hover:border-[#3F6E6A]/70 hover:bg-[rgba(46,74,98,0.25)]',
        !isReady ? 'pointer-events-none opacity-45' : '',
    ].join(' ');

    return (
        <article className="group rounded-xl border border-[#232734] bg-[#151821] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3F6E6A]/70 hover:shadow-[0_0_0_1px_rgba(63,110,106,0.2),0_10px_24px_rgba(63,110,106,0.14)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg border border-[#283041] bg-[#171D29] p-2">
                        <FileText className="h-4 w-4 text-[#9AA3B2]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#E6EAF2]">
                            {pdf.originalName}
                        </h3>
                    </div>
                </div>
                <span
                    className={[
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        isReady
                            ? 'border-[#3F6E6A]/45 bg-[rgba(63,110,106,0.15)] text-[#B7CCC8]'
                            : 'border-[#2E4A62]/45 bg-[rgba(46,74,98,0.2)] text-[#B4C7D6]',
                    ].join(' ')}
                >
                    {isReady ? 'Ready' : 'Processing'}
                </span>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-[#9AA3B2]">
                <p className="flex items-center gap-1.5">
                    <Layers3 className="h-3.5 w-3.5" />
                    {pdf.pageCount ?? '—'} pages
                </p>
                <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(pdf.createdAt)}
                </p>
            </div>

            <div className="mt-4 rounded-lg border border-[#283041] bg-[#141A26] p-3">
                {isReady ? (
                    <p className="flex items-center gap-2 text-xs font-medium text-[#B9D2CD]">
                        <span className="h-2 w-2 rounded-full bg-[#3F6E6A]" />
                        AI Ready
                    </p>
                ) : (
                    <ProcessingState compact />
                )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Link href="/dashboard/ask-pdf" className={actionClass}>
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Ask PDF
                </Link>
                <Link href="/dashboard/mock-tests/mcq" className={actionClass}>
                    <TestTube2 className="h-3.5 w-3.5" />
                    Generate MCQ
                </Link>
                <Link href="/dashboard/mock-tests/long-questions" className={actionClass}>
                    <NotebookPen className="h-3.5 w-3.5" />
                    Practice Questions
                </Link>
                <Button
                    variant="outline"
                    size="sm"
                    className="justify-start border-[#2A3040] bg-[#171D2A] text-[#C4CCD9] hover:border-red-400/50 hover:bg-red-900/20 hover:text-red-200"
                    disabled
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </Button>
            </div>
        </article>
    );
}
