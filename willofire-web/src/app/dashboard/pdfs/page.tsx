'use client';

import { useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/components/shared/pdfs/UploadDropzone';
import { PDFGrid } from '@/components/shared/pdfs/PDFGrid';
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#E6EAF2]">Your Study Library</h1>
                    <p className="mt-2 text-[#9AA3B2]">Manage and interact with your learning materials</p>
                </div>
                <Button
                    className="h-10 gap-2 px-5 wf-accent-gradient text-primary-foreground wf-soft-glow-hover"
                    onClick={() => setOpenPickerSignal((current) => current + 1)}
                >
                    <Upload className="h-4 w-4" />
                    Upload PDF
                </Button>
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

            <PDFGrid pdfs={pdfs} isLoading={pdfsQuery.isLoading} />
        </div>
    );
}
