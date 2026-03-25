'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

export type EvalState = 'idle' | 'uploading' | 'evaluating' | 'completed' | 'failed';

interface EvaluationUploadCardProps {
    state: EvalState;
    progress: number;
    errorMessage?: string;
    onSubmit: (payload: { questionRef: string; file: File }) => Promise<void>;
}

export function EvaluationUploadCard({ state, progress, errorMessage, onSubmit }: EvaluationUploadCardProps) {
    const [dragActive, setDragActive] = useState(false);
    const [questionRef, setQuestionRef] = useState('');

    const handleDrag = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (state !== 'idle' && state !== 'failed') return;

            if (e.type === 'dragenter' || e.type === 'dragover') {
                setDragActive(true);
            } else if (e.type === 'dragleave') {
                setDragActive(false);
            }
        },
        [state],
    );

    const startUpload = useCallback(
        async (file: File) => {
            if (!questionRef.trim()) return;
            await onSubmit({ questionRef: questionRef.trim(), file });
        },
        [onSubmit, questionRef],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if ((state !== 'idle' && state !== 'failed') || !questionRef.trim()) return;
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                void startUpload(e.dataTransfer.files[0]);
            }
        },
        [state, questionRef, startUpload],
    );

    if (state === 'completed') return null;

    return (
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm mb-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">Evaluate Your Answer</h2>
                <p className="text-sm text-muted-foreground mt-1">Upload an image or PDF of your written answer for instant AI grading and feedback.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/85">Question Reference</label>
                    <Input
                        placeholder="e.g. Q3 from Thermodynamics Mock Test"
                        value={questionRef}
                        onChange={(e) => setQuestionRef(e.target.value)}
                        disabled={state !== 'idle' && state !== 'failed'}
                        className="bg-muted/35 border-border focus-visible:ring-[#3F6E6A]/30"
                    />
                </div>

                <div
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${dragActive && questionRef.trim() ? 'border-[#3F6E6A]/70 bg-[rgba(63,110,106,0.16)]' : 'border-border bg-muted/35'}
                    ${state === 'idle' && !questionRef.trim() ? 'opacity-60 cursor-not-allowed' : ''}
                    ${(state === 'idle' || state === 'failed') && questionRef.trim() ? 'hover:bg-muted/55 cursor-pointer' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {(state === 'idle' || state === 'failed') && (
                        <input
                            type="file"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            accept=".pdf,image/*"
                            disabled={(!questionRef.trim())}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    void startUpload(e.target.files[0]);
                                }
                            }}
                        />
                    )}

                    {(state === 'idle' || state === 'failed') && (
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm mb-4">
                                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                            <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                            {!questionRef.trim() && (
                                <p className="mt-4 text-xs font-medium text-[#95AAA7]">Please enter a question reference first.</p>
                            )}
                            {state === 'failed' && errorMessage ? (
                                <p className="mt-4 text-xs font-medium text-red-600 flex items-center justify-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errorMessage}
                                </p>
                            ) : null}
                        </div>
                    )}

                    {state === 'uploading' && (
                        <div className="w-full max-w-sm text-center">
                            <FileText className="mx-auto h-8 w-8 text-[#8EA7BA] mb-4 animate-pulse" />
                            <p className="text-sm font-medium text-foreground mb-2">Uploading answer sheet...</p>
                            <Progress className="h-2 w-full" value={progress} />
                        </div>
                    )}

                    {state === 'evaluating' && (
                        <div className="text-center mt-2">
                            <Loader2 className="mx-auto h-10 w-10 text-[#89A09D] animate-spin mb-4" />
                            <p className="text-sm font-semibold text-foreground">Our AI is evaluating your answer...</p>
                            <p className="mt-1 text-xs text-muted-foreground">Checking against marking schemes and extracting text.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
