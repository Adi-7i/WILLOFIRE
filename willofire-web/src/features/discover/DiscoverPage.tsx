'use client';

import { useState } from 'react';
import { RefreshCcw, BookOpen } from 'lucide-react';
import { useDiscoverArticles } from '@/hooks/use-discover';
import { BackendCategory, DiscoverArticle } from '@/lib/api/discover';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FeaturedCard } from './FeaturedCard';
import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { Card } from '@/components/ui/card';

/**
 * Category Mapping: Frontend Tab -> Backend Category
 * Null means "All / Headlines"
 */
const TABS: { id: string; label: string; backendCategory: BackendCategory | null }[] = [
    { id: 'headlines', label: "Today's Headlines", backendCategory: null }, // Shows highest ranked across all
    { id: 'economy', label: 'Economy', backendCategory: 'economy' },
    { id: 'polity', label: 'Polity', backendCategory: 'polity' },
    { id: 'international', label: 'International Relations', backendCategory: 'international-relations' },
    { id: 'science', label: 'Science & Tech', backendCategory: 'science-tech' },
    { id: 'environment', label: 'Environment', backendCategory: 'environment' },
    { id: 'defense', label: 'Defense', backendCategory: 'defense' },
];

export function DiscoverPage() {
    const [activeTab, setActiveTab] = useState<string>('headlines');

    // Find the mapped backend category for the current tab
    const currentTabConfig = TABS.find((t) => t.id === activeTab);
    const backendCategory = currentTabConfig?.backendCategory ?? undefined;

    // Fetch live data (asks for 50 limit to ensure we have enough to fill featured + grid)
    const { data: articles, isLoading, isError, refetch } = useDiscoverArticles(backendCategory, 50);

    // FIX 10: Client-side robust safety filter
    const isArticleTrustworthy = (article: DiscoverArticle) => {
        if (!article.title || !article.summary || !article.examRelevance) return false;
        const diffHours = (new Date().getTime() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
        return diffHours <= 72; // Redundant check, but adds client safety layer
    };

    const trustedArticles = articles ? articles.filter(isArticleTrustworthy) : [];
    const hasArticles = trustedArticles.length > 0;

    // Split into Featured (top 3) and Grid (the rest)
    const featuredArticles = hasArticles ? trustedArticles.slice(0, 3) : [];
    const gridArticles = hasArticles ? trustedArticles.slice(3) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    Current Affairs Intelligence
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Curated important developments with exam relevance for aspirants
                </p>
            </div>

            {/* Category Tabs */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="h-11 bg-slate-100/50 p-1 rounded-lg justify-start w-max">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="rounded-md px-4 py-2 font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Error State */}
            {isError && !isLoading && (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-slate-50">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <RefreshCcw className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load feed</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">
                        We encountered an error while safely fetching your secure news feed.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Retry Now
                    </Button>
                </Card>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-8">
                    {/* Featured Loading */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                        <div className="lg:col-span-2">
                            <ArticleSkeleton />
                        </div>
                    </div>
                    {/* Grid Loading */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && !hasArticles && (
                <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed bg-slate-50">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No current updates available</h3>
                    <p className="text-slate-500 max-w-sm">
                        Check back later. Our engine gathers high-quality sources every hour.
                    </p>
                </Card>
            )}

            {/* Success State: Content */}
            {!isLoading && !isError && hasArticles && (
                <div className="space-y-10">
                    {/* Featured Top Section */}
                    {featuredArticles.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900 px-1 flex items-center gap-2">
                                <span className="w-2 h-6 bg-blue-600 rounded-sm inline-block" />
                                Top Stories
                            </h2>
                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                                {/* Primary Featured (takes half width or full on mobile) */}
                                {featuredArticles[0] && (
                                    <div className="lg:col-span-12 xl:col-span-8">
                                        <FeaturedCard article={featuredArticles[0]} />
                                    </div>
                                )}

                                {/* Secondary Featured (stacked vertically on right) */}
                                {featuredArticles.slice(1).length > 0 && (
                                    <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                                        {featuredArticles.slice(1).map((article) => (
                                            <div key={article._id} className="flex-1">
                                                <ArticleCard article={article} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Standard Grid Section */}
                    {gridArticles.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900 px-1 flex items-center gap-2">
                                <span className="w-2 h-6 bg-amber-500 rounded-sm inline-block" />
                                More Insights
                            </h2>
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {gridArticles.map((article) => (
                                    <ArticleCard key={article._id} article={article} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
