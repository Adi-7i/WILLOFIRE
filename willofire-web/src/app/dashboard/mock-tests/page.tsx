'use client';

import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';

export default function MockTestsLandingPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mock Tests</h1>
                <p className="text-slate-500 mt-2">Practice with AI-generated tests from your study materials.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden flex flex-col relative group hover:border-blue-300 transition-colors">
                    <div className="p-6 flex-1">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">MCQ Practice</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Test your objective knowledge with AI-generated multiple choice questions. Receive instant scoring and detailed explanations.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <Link href="/dashboard/mock-tests/mcq" className="w-full">
                            <button className="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white font-medium transition-colors h-11">
                                Start MCQ Practice
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden flex flex-col relative group hover:border-blue-300 transition-colors">
                    <div className="p-6 flex-1">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Long Question Practice</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Develop comprehensive answers with structured subjective questions. Simulate real exam conditions with generated prompts.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <Link href="/dashboard/mock-tests/long-questions" className="w-full">
                            <button className="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white font-medium transition-colors h-11">
                                Start Long Question Practice
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
