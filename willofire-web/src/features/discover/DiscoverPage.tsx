'use client';

import { useState } from 'react';
import { BookOpen, RefreshCcw, Sparkles } from 'lucide-react';
import { useDiscoverArticles } from '@/hooks/use-discover';
import { BackendCategory } from '@/lib/api/discover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeaturedCard } from './FeaturedCard';
import { ArticleCard } from './ArticleCard';
import { HorizontalArticleCard } from './HorizontalArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { getFreshnessLabel, isArticleRenderable, isTrendingArticle } from './discover.utils';

const TABS: { id: string; label: string; backendCategory: BackendCategory }[] = [
    { id: 'headlines', label: "Today's Headlines", backendCategory: 'todays-headlines' },
    { id: 'economy', label: 'Economy', backendCategory: 'economy' },
    { id: 'polity', label: 'Polity', backendCategory: 'polity' },
    { id: 'international', label: 'International Relations', backendCategory: 'international-relations' },
    { id: 'science', label: 'Science & Tech', backendCategory: 'science-tech' },
    { id: 'environment', label: 'Environment', backendCategory: 'environment' },
    { id: 'defense', label: 'Defense', backendCategory: 'defense' },
];

export function DiscoverPage() {
    const [activeTab, setActiveTab] = useState<string>('headlines');

    const currentTabConfig = TABS.find((t) => t.id === activeTab);
    const backendCategory = currentTabConfig?.backendCategory;

    const { data: articles, isLoading, isError, refetch } = useDiscoverArticles(backendCategory, 50);

    const trustedArticles = (articles ?? [])
        .filter(isArticleRenderable)
        .sort((a, b) => {
            if (b.rankScore !== a.rankScore) {
                return b.rankScore - a.rankScore;
            }
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });

    const hasArticles = trustedArticles.length > 0;
    const featuredArticle = trustedArticles[0];
    const compactArticles = trustedArticles.slice(1, 4);
    const horizontalArticles = trustedArticles.slice(4);
    const topStoryFreshness = featuredArticle ? getFreshnessLabel(featuredArticle.publishedAt) : 'Awaiting refresh';

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
                            Premium personalized current affairs feed powered by trusted sources.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top Story</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{topStoryFreshness}</p>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Personalized recommendation feed
                </div>
            </section>

            <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="h-11 rounded-xl bg-white/80 p-1 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {isError && !isLoading && (
                <Card className="items-center border-dashed border-slate-300 bg-white p-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <RefreshCcw className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">Unable to refresh Discover feed</h3>
                    <p className="mb-6 max-w-md text-slate-500">
                        We could not fetch trusted-source recommendations right now.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-full">
                        <RefreshCcw className="h-4 w-4" />
                        Retry
                    </Button>
                </Card>
            )}

            {isLoading && (
                <div className="space-y-6">
                    <ArticleSkeleton />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                    </div>
                    <ArticleSkeleton />
                    <ArticleSkeleton />
                </div>
            )}

            {!isLoading && !isError && !hasArticles && (
                <Card className="items-center border-dashed border-slate-300 bg-white p-14 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">No stories available yet</h3>
                    <p className="max-w-md text-slate-500">
                        New trusted articles will appear here after the next discovery refresh cycle.
                    </p>
                </Card>
            )}

            {!isLoading && !isError && hasArticles && (
                <div className="space-y-7">
                    {featuredArticle && (
                        <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <FeaturedCard article={featuredArticle} isTrending={isTrendingArticle(featuredArticle, 0)} />
                        </section>
                    )}

                    {compactArticles.length > 0 && (
                        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            {compactArticles.map((article, index) => (
                                <div
                                    key={article._id}
                                    className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                                    style={{ animationDelay: `${80 * (index + 1)}ms` }}
                                >
                                    <ArticleCard article={article} isTrending={isTrendingArticle(article, index + 1)} />
                                </div>
                            ))}
                        </section>
                    )}

                    {horizontalArticles.length > 0 && (
                        <section className="space-y-5">
                            {horizontalArticles.map((article, index) => (
                                <div
                                    key={article._id}
                                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                    style={{ animationDelay: `${80 * (index + 2)}ms` }}
                                >
                                    <HorizontalArticleCard article={article} index={index} />
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
