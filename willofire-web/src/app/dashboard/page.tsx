'use client';

import { StatCard } from '@/components/shared/StatCard';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { Sparkles } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard';

export default function DashboardPage() {
    const { data, isLoading, isError } = useDashboardData();

    const stats = data?.stats ?? {
        pdfsUploaded: 0,
        mockTestsTaken: 0,
        evaluations: 0,
        pdfQuestions: 0,
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back to Willofire
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Here&apos;s what&apos;s happening with your exam prep today.
                    </p>
                </div>

                <div className="bg-[rgba(63,110,106,0.16)] border border-[#3F6E6A]/35 rounded-lg p-4 max-w-sm flex items-start gap-3 w-full md:w-auto">
                    <Sparkles className="h-5 w-5 text-[#89A09D] shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-foreground/85 italic">
                        &quot;Success is the sum of small efforts, repeated day in and day out.&quot;
                    </p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="PDFs Uploaded" value={`${stats.pdfsUploaded}`} icon="pdf" />
                <StatCard title="Mock Tests Taken" value={`${stats.mockTestsTaken}`} icon="mock" />
                <StatCard title="Evaluations" value={`${stats.evaluations}`} icon="evaluation" />
                <StatCard title="PDF Questions" value={`${stats.pdfQuestions}`} icon="ask" />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-border bg-card shadow-sm p-6 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[rgba(46,74,98,0.22)] text-[#8EA7BA] rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {isLoading ? 'Loading Performance Summary' : 'Performance Insights (Upcoming)'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mt-2 font-medium">
                            {isError
                                ? 'Dashboard stats are temporarily unavailable. Try again in a moment.'
                                : 'We are analyzing your mock test scores to generate detailed insights and weak-area identification.'}
                        </p>
                    </div>
                </div>

                <div>
                    <ActivityFeed items={data?.activity ?? []} />
                </div>
            </div>
        </div>
    );
}
