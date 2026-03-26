'use client';

import { FileText, CheckCircle2 } from 'lucide-react';
import { PdfListItem } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface PDFSelectorListProps {
    pdfs: PdfListItem[];
    selectedPdfIds: string[];
    onTogglePdf: (pdfId: string) => void;
    disabled?: boolean;
}

const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PDFSelectorList({ pdfs, selectedPdfIds, onTogglePdf, disabled = false }: PDFSelectorListProps) {
    if (pdfs.length === 0) {
        return (
            <div className="py-2 text-sm text-[#9AA3B2]">
                No ready PDFs available.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {pdfs.map((pdf) => {
                const isSelected = selectedPdfIds.includes(pdf.id);

                return (
                    <button
                        key={pdf.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onTogglePdf(pdf.id)}
                        className={cn(
                            'h-[60px] w-full rounded-xl px-3.5 py-2 text-left transition-all duration-200',
                            isSelected
                                ? 'bg-[rgba(63,110,106,0.12)] ring-1 ring-[#3F6E6A]/45'
                                : 'hover:bg-[#181C26]',
                            disabled && 'cursor-not-allowed opacity-65',
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[#E6EAF2]">
                                    <FileText className="h-4 w-4 shrink-0 text-[#9AA3B2]" />
                                    <span className="truncate text-sm">{pdf.originalName}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-[#9AA3B2]">
                                    {formatFileSize(pdf.fileSizeBytes)}
                                    {typeof pdf.pageCount === 'number' ? ` • ${pdf.pageCount} pages` : ''}
                                </p>
                            </div>

                            <span className="mt-0.5 shrink-0">
                                {isSelected ? (
                                    <CheckCircle2 className="h-4 w-4 text-[#5BC9B8]" />
                                ) : (
                                    <span className="block h-4 w-4 rounded-full border border-[#3A4253]" />
                                )}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
