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
            <div className="rounded-xl border border-dashed border-[#2A3342] px-4 py-5 text-center">
                <FileText className="mx-auto mb-2 h-5 w-5 text-[#64748B]" />
                <p className="text-sm text-[#9AA3B2]">No ready PDFs available.</p>
                <p className="mt-1 text-xs text-[#64748B]">Upload a PDF to get started.</p>
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
                            'group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-200',
                            isSelected
                                ? 'border-[#3F6E6A]/40 bg-[rgba(63,110,106,0.1)]'
                                : 'border-[#1E2433] bg-[#131823] hover:border-[#2A3342] hover:bg-[#16202F]',
                            disabled && 'cursor-not-allowed opacity-65',
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                    isSelected ? 'bg-[rgba(63,110,106,0.2)]' : 'bg-[#1E2433]'
                                )}>
                                    <FileText className={cn('h-3.5 w-3.5', isSelected ? 'text-[#5BC9B8]' : 'text-[#64748B]')} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium text-[#D8DFE6]">{pdf.originalName}</p>
                                    <p className="text-[11px] text-[#64748B]">
                                        {formatFileSize(pdf.fileSizeBytes)}
                                        {typeof pdf.pageCount === 'number' ? ` · ${pdf.pageCount} pages` : ''}
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0">
                                {isSelected ? (
                                    <CheckCircle2 className="h-4 w-4 text-[#5BC9B8]" />
                                ) : (
                                    <span className="block h-4 w-4 rounded-full border border-[#2A3342] group-hover:border-[#3A4A60]" />
                                )}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
