'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

export type EvalState = 'idle' | 'uploading' | 'evaluating' | 'completed';

interface EvaluationUploadCardProps {
    state: EvalState;
    onUploadStart: () => void;
    onUploadProgress: (progress: number) => void;
    onEvaluating: () => void;
    onCompleted: () => void;
}

export function EvaluationUploadCard({
    state,
    onUploadStart,
    onUploadProgress,
    onEvaluating,
    onCompleted,
}: EvaluationUploadCardProps) {
    const [dragActive, setDragActive] = useState(false);
    const [questionRef, setQuestionRef] = useState('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (state !== 'idle') return;

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, [state]);

    const simulateUpload = useCallback(() => {
        if (!questionRef.trim()) return;

        onUploadStart();
        let progress = 0;

        const interval = setInterval(() => {
            progress += 10;
            onUploadProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);
                onEvaluating();

                // Simulating the AI evaluation delay
                setTimeout(() => {
                    onCompleted();
                }, 2500);
            }
        }, 200);
    }, [questionRef, onUploadStart, onUploadProgress, onEvaluating, onCompleted]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (state !== 'idle' || !questionRef.trim()) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            simulateUpload();
        }
    }, [state, questionRef, simulateUpload]);

    if (state === 'completed') return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Evaluate Your Answer</h2>
                <p className="text-sm text-slate-500 mt-1">Upload an image or PDF of your written answer for instant AI grading and feedback.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Question Reference</label>
                    <Input
                        placeholder="e.g. Q3 from Thermodynamics Mock Test"
                        value={questionRef}
                        onChange={(e) => setQuestionRef(e.target.value)}
                        disabled={state !== 'idle'}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    />
                </div>

                <div
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${dragActive && questionRef.trim() ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50'
                        } ${state === 'idle' && !questionRef.trim() ? 'opacity-60 cursor-not-allowed' : ''} ${state === 'idle' && questionRef.trim() ? 'hover:bg-slate-100 cursor-pointer' : ''
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {state === 'idle' && (
                        <input
                            type="file"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            accept=".pdf,image/*"
                            disabled={state !== 'idle' || !questionRef.trim()}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    simulateUpload();
                                }
                            }}
                        />
                    )}

                    {state === 'idle' && (
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                                <UploadCloud className="h-6 w-6 text-slate-500" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">
                                Click to upload or drag & drop
                            </p>
                            <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                            {!questionRef.trim() && (
                                <p className="mt-4 text-xs font-medium text-amber-600">Please enter a question reference first.</p>
                            )}
                        </div>
                    )}

                    {state === 'uploading' && (
                        <div className="w-full max-w-sm text-center">
                            <FileText className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-pulse" />
                            <p className="text-sm font-medium text-slate-900 mb-2">Uploading answer sheet...</p>
                            {/* Note: progress is passed from parent but for simplicity we rely on internal simulation above, so we don't display the numeric progress prop directly here, or we can use it if passed. Assuming 50% for visual. */}
                            <Progress className="h-2 w-full" value={60} />
                        </div>
                    )}

                    {state === 'evaluating' && (
                        <div className="text-center mt-2">
                            <Loader2 className="mx-auto h-10 w-10 text-amber-500 animate-spin mb-4" />
                            <p className="text-sm font-semibold text-slate-900">Our AI is evaluating your answer...</p>
                            <p className="mt-1 text-xs text-slate-500">Checking against marking schemes and extracting text.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
