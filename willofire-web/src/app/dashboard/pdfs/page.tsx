'use client';

import { UploadCard } from '@/components/shared/UploadCard';
import { PdfList } from '@/components/shared/PdfList';
import { usePdfs, useUploadPdf } from '@/hooks/use-pdfs';

export default function PdfsPage() {
    const pdfsQuery = usePdfs();
    const uploadMutation = useUploadPdf();

    const hasProcessingFiles = (pdfsQuery.data ?? []).some(
        (pdf) => pdf.status === 'uploaded' || pdf.status === 'processing',
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My PDFs</h1>
                <p className="text-muted-foreground mt-2">Upload and manage your study materials.</p>
            </div>

            <UploadCard
                onUpload={async (file, onProgress) => {
                    await uploadMutation.mutateAsync({ file, onProgress });
                }}
                isMutating={uploadMutation.isPending}
                hasProcessingFiles={hasProcessingFiles}
                errorMessage={uploadMutation.error?.message}
            />

            <PdfList
                pdfs={pdfsQuery.data ?? []}
                isLoading={pdfsQuery.isLoading}
                isError={pdfsQuery.isError}
            />
        </div>
    );
}
