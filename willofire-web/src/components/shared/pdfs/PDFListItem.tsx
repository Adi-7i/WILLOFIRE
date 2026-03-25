import { Download, FileText, Trash2 } from 'lucide-react';
import { PdfListItem } from '@/lib/api/types';

interface PDFListItemProps {
    pdf: PdfListItem;
    onDownload?: (pdf: PdfListItem) => void;
    onDelete?: (pdf: PdfListItem) => void;
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PDFListItem({ pdf, onDownload, onDelete }: PDFListItemProps) {
    return (
        <article className="group flex items-center justify-between gap-4 rounded-xl border border-[#232734] bg-[#151821] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2B3242] hover:bg-[#171B25]">
            <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-md border border-[#2A3142] bg-[#181D29] p-2">
                    <FileText className="h-4 w-4 text-[#9AA3B2]" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-[#E6EAF2]">{pdf.originalName}</p>
                    <p className="mt-1 text-xs leading-5 text-[#9AA3B2]">
                        {formatFileSize(pdf.fileSizeBytes)} <span className="mx-2 text-[#414A5B]">•</span> {formatDate(pdf.createdAt)}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                <button
                    type="button"
                    className="rounded-md p-2 text-[#9AA3B2] transition-colors hover:bg-[#1B2230] hover:text-[#E6EAF2]"
                    onClick={() => onDownload?.(pdf)}
                    aria-label={`Download ${pdf.originalName}`}
                >
                    <Download className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="rounded-md p-2 text-[#9AA3B2] transition-colors hover:bg-[#1B2230] hover:text-red-300"
                    onClick={() => onDelete?.(pdf)}
                    aria-label={`Delete ${pdf.originalName}`}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </article>
    );
}

