'use client';

import { useMemo, useState } from 'react';
import { Bell, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/components/shared/pdfs/UploadDropzone';
import { PDFListItem } from '@/components/shared/pdfs/PDFListItem';
import { EmptyState } from '@/components/shared/pdfs/EmptyState';
import { FeatureCard } from '@/components/shared/pdfs/FeatureCard';
import { PdfListItem as PdfItemType } from '@/lib/api/types';
import { usePdfs, useUploadPdf } from '@/hooks/use-pdfs';

export default function PdfsPage() {
    const pdfsQuery = usePdfs();
    const uploadMutation = useUploadPdf();
    const [openPickerSignal, setOpenPickerSignal] = useState(0);

    const hasProcessingFiles = (pdfsQuery.data ?? []).some(
        (pdf) => pdf.status === 'uploaded' || pdf.status === 'processing',
    );

    const pdfs = useMemo(
        () =>
            [...(pdfsQuery.data ?? [])].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            ),
        [pdfsQuery.data],
    );

    const handleDownload = (_pdf: PdfItemType) => {
        // Placeholder for future backend file download endpoint.
    };

    const handleDelete = (_pdf: PdfItemType) => {
        // Placeholder for future delete action.
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[34px] font-medium leading-tight tracking-tight text-[#E6EAF2]">My Study Materials</h1>
                    <p className="mt-2 text-sm leading-6 text-[#9AA3B2]">Manage and organize your uploaded PDFs</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Search"
                        className="rounded-md p-2 text-[#9AA3B2] transition-colors hover:bg-[#151821] hover:text-[#E6EAF2]"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="rounded-md p-2 text-[#9AA3B2] transition-colors hover:bg-[#151821] hover:text-[#E6EAF2]"
                    >
                        <Bell className="h-4 w-4" />
                    </button>
                    <Button
                        className="h-10 gap-2 rounded-full px-5 wf-accent-gradient text-primary-foreground wf-soft-glow-hover"
                        onClick={() => setOpenPickerSignal((current) => current + 1)}
                    >
                        <Upload className="h-4 w-4" />
                        Upload PDF
                    </Button>
                </div>
            </div>

            <UploadDropzone
                onUpload={async (file, onProgress) => {
                    await uploadMutation.mutateAsync({ file, onProgress });
                }}
                isMutating={uploadMutation.isPending}
                hasProcessingFiles={hasProcessingFiles}
                openPickerSignal={openPickerSignal}
                errorMessage={uploadMutation.error?.message}
            />

            {pdfsQuery.isError && (
                <div className="rounded-xl border border-red-500/25 bg-red-900/15 px-4 py-3 text-sm text-red-200">
                    Unable to load your library right now. Please refresh in a moment.
                </div>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9AA3B2]">
                        Archive <span className="ml-1 rounded bg-[#1A2332] px-1.5 py-0.5 text-[10px]">{pdfs.length} PDFs</span>
                    </p>
                    <p className="text-xs text-[#9AA3B2]">Sort by: Date Added</p>
                </div>

                {pdfsQuery.isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-16 animate-pulse rounded-xl border border-[#232734] bg-[#151821]" />
                        ))}
                    </div>
                ) : pdfs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {pdfs.map((pdf) => (
                            <PDFListItem
                                key={pdf.id}
                                pdf={pdf}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <FeatureCard
                    title="Smart Summary AI"
                    description="Generate concise summaries and flashcards from your PDFs using AI"
                    ctaLabel="Try Summarizer"
                    ctaHref="/dashboard/ask-pdf"
                />
                <FeatureCard
                    title="Practice Mode"
                    description="Convert your PDFs into multiple-choice questions"
                    compact
                />
            </section>
        </div>
    );
}
