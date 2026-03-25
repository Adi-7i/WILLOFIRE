'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ProcessingState } from '@/components/shared/pdfs/ProcessingState';

type UploadState = 'idle' | 'uploading' | 'processing' | 'failed';

interface UploadDropzoneProps {
    onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>;
    isMutating: boolean;
    hasProcessingFiles: boolean;
    openPickerSignal: number;
    errorMessage?: string;
}

export function UploadDropzone({
    onUpload,
    isMutating,
    hasProcessingFiles,
    openPickerSignal,
    errorMessage,
}: UploadDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fileInputRef.current?.click();
    }, [openPickerSignal]);

    const startUpload = useCallback(
        async (file: File) => {
            try {
                setUploadState('uploading');
                setProgress(0);
                await onUpload(file, setProgress);
                setUploadState('processing');
            } catch {
                setUploadState('failed');
            }
        },
        [onUpload],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void startUpload(file);
        },
        [startUpload],
    );

    const effectiveState: UploadState = hasProcessingFiles
        ? 'processing'
        : uploadState === 'uploading' || uploadState === 'failed'
            ? uploadState
            : uploadState === 'processing'
                ? 'processing'
                : 'idle';

    return (
        <section className="rounded-2xl border border-[#232734] bg-[#151821] p-5 sm:p-6">
            <div
                className={[
                    'relative rounded-xl border-2 border-dashed px-6 py-8 sm:px-8 transition-all duration-200',
                    dragActive ? 'border-[#3F6E6A] bg-[rgba(63,110,106,0.12)]' : 'border-[#2B3040] bg-[#131722]',
                    'hover:border-[#3F6E6A]/70',
                ].join(' ')}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                }}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    disabled={isMutating}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void startUpload(file);
                    }}
                />

                {effectiveState === 'idle' && (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-3 rounded-full border border-[#2A3241] bg-[#181E2A] p-3">
                            <FileUp className="h-5 w-5 text-[#9AA3B2]" />
                        </div>
                        <p className="text-sm font-medium text-[#E6EAF2]">
                            Drop your study material here or click to upload
                        </p>
                        <p className="mt-1 text-xs text-[#9AA3B2]">PDF up to 10MB</p>
                    </div>
                )}

                {effectiveState === 'uploading' && (
                    <div className="mx-auto w-full max-w-xl">
                        <div className="mb-3 flex items-center gap-2 text-sm text-[#E6EAF2]">
                            <Loader2 className="h-4 w-4 animate-spin text-[#8EB2AE]" />
                            Uploading document...
                        </div>
                        <Progress
                            value={progress}
                            className="h-2 bg-[rgba(46,74,98,0.35)]"
                        />
                    </div>
                )}

                {effectiveState === 'processing' && (
                    <div className="mx-auto max-w-xl">
                        <ProcessingState />
                    </div>
                )}

                {effectiveState === 'failed' && (
                    <div className="text-center">
                        <p className="text-sm font-medium text-red-300">Upload failed</p>
                        <p className="mt-1 text-xs text-[#9AA3B2]">{errorMessage ?? 'Please retry with a valid PDF file.'}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
