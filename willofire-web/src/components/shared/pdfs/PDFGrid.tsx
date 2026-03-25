import { PdfListItem } from '@/lib/api/types';
import { PDFCard } from '@/components/shared/pdfs/PDFCard';
import { EmptyLibraryState } from '@/components/shared/pdfs/EmptyLibraryState';

interface PDFGridProps {
    pdfs: PdfListItem[];
    isLoading: boolean;
}

function LibrarySkeleton() {
    return (
        <div className="rounded-xl border border-[#232734] bg-[#151821] p-4">
            <div className="h-4 w-2/3 rounded bg-[#232A39]" />
            <div className="mt-3 h-3 w-1/2 rounded bg-[#202738]" />
            <div className="mt-5 h-10 rounded-lg bg-[#202738]" />
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-[#202738]" />
                <div className="h-8 rounded bg-[#202738]" />
            </div>
        </div>
    );
}

export function PDFGrid({ pdfs, isLoading }: PDFGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <LibrarySkeleton key={index} />
                ))}
            </div>
        );
    }

    if (pdfs.length === 0) {
        return <EmptyLibraryState />;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pdfs.map((pdf) => (
                <PDFCard key={pdf.id} pdf={pdf} />
            ))}
        </div>
    );
}

