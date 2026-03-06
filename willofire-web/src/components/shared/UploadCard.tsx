'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type UploadState = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

export function UploadCard() {
    const [dragActive, setDragActive] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const simulateUpload = useCallback(() => {
        setUploadState('uploading');
        setProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploadState('processing');

                    // Simulate backend processing
                    setTimeout(() => {
                        setUploadState('ready');
                        // Reset after showing success
                        setTimeout(() => {
                            setUploadState('idle');
                            setProgress(0);
                        }, 3000);
                    }, 2000);

                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            simulateUpload();
        }
    }, [simulateUpload]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Upload new PDF</h2>
                <p className="text-sm text-slate-500">Add a textbook, past paper, or notes to generate mock tests.</p>
            </div>

            <div
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    accept=".pdf"
                    disabled={uploadState !== 'idle'}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            simulateUpload();
                        }
                    }}
                />

                {uploadState === 'idle' && (
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                            <UploadCloud className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            Click to upload or drag & drop
                        </p>
                        <p className="mt-1 text-xs text-slate-500">PDFs up to 10MB</p>
                    </div>
                )}

                {uploadState === 'uploading' && (
                    <div className="w-full max-w-sm text-center">
                        <FileText className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-pulse" />
                        <p className="text-sm font-medium text-slate-900 mb-2">Uploading...</p>
                        <Progress value={progress} className="h-2 w-full" />
                    </div>
                )}

                {uploadState === 'processing' && (
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 text-amber-500 animate-spin mb-4" />
                        <p className="text-sm font-medium text-slate-900">Processing Document</p>
                        <p className="mt-1 text-xs text-slate-500">Extracting text and structure...</p>
                    </div>
                )}

                {uploadState === 'ready' && (
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Upload Complete</p>
                        <p className="mt-1 text-xs text-slate-500">Your PDF is ready to use.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
