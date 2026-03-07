'use client';

import { BookOpen } from 'lucide-react';

export function DiscoverPage() {
    return (
        <div className="space-y-8 pb-14">
            <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-[#fbfbf8] px-5 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            Discovery
                        </h1>
                        <p className="mt-2 text-base text-slate-600 md:text-lg">
                            Premium personalized current affairs feed coming soon.
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-32 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">New Discovery Engine Coming Soon</h3>
                <p className="max-w-md text-slate-500">
                    We are rebuilding the discovery experience from the ground up to bring you an unparalleled, Perplexity-style intelligence feed.
                </p>
            </div>
        </div>
    );
}
