'use client';

import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';

export default function MockTestsLandingPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Mock Tests</h1>
                <p className="text-muted-foreground mt-2">Practice with AI-generated tests from your study materials.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-[#2E4A62]/55 bg-card shadow-sm overflow-hidden flex flex-col relative group hover:border-[#3F6E6A]/50 transition-colors wf-soft-glow-hover">
                    <div className="p-6 flex-1">
                        <div className="w-12 h-12 bg-[rgba(46,74,98,0.22)] text-[#93ADBF] rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">MCQ Practice</h3>
                        <p className="text-sm text-muted-foreground mb-6 font-medium">
                            Test your objective knowledge with AI-generated multiple choice questions. Receive instant scoring and detailed explanations.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <Link href="/dashboard/mock-tests/mcq" className="w-full">
                            <button className="w-full rounded-md wf-accent-gradient px-4 py-2 text-primary-foreground font-medium transition-colors h-11 wf-soft-glow-hover">
                                Start MCQ Practice
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-[#2E4A62]/55 bg-card shadow-sm overflow-hidden flex flex-col relative group hover:border-[#3F6E6A]/50 transition-colors wf-soft-glow-hover">
                    <div className="p-6 flex-1">
                        <div className="w-12 h-12 bg-[rgba(46,74,98,0.22)] text-[#93ADBF] rounded-xl flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Long Question Practice</h3>
                        <p className="text-sm text-muted-foreground mb-6 font-medium">
                            Develop comprehensive answers with structured subjective questions. Simulate real exam conditions with generated prompts.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <Link href="/dashboard/mock-tests/long-questions" className="w-full">
                            <button className="w-full rounded-md wf-accent-gradient px-4 py-2 text-primary-foreground font-medium transition-colors h-11 wf-soft-glow-hover">
                                Start Long Question Practice
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
