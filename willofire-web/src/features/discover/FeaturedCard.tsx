'use client';

import { useState } from 'react';
import { Bookmark, Calendar, Ellipsis, Flame, Globe2, Share2 } from 'lucide-react';
import { DiscoverArticle } from '@/lib/api/discover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDiscoverCategory, getFreshnessLabel, getSourceHostLabel, getTopicChips } from './discover.utils';

interface FeaturedCardProps {
    article: DiscoverArticle;
    isTrending?: boolean;
}

export function FeaturedCard({ article, isTrending = false }: FeaturedCardProps) {
    const [imageError, setImageError] = useState(false);
    const chips = getTopicChips(article);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(article.publishedAt));

    return (
        <article className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(15,23,42,0.10)] md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {isTrending && (
                                <Badge className="rounded-full border-0 bg-rose-100 px-3 py-1 text-rose-700 hover:bg-rose-100">
                                    <Flame className="mr-1 h-3.5 w-3.5" />
                                    Trending
                                </Badge>
                            )}
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-700">
                                {formatDiscoverCategory(article.category)}
                            </Badge>
                            {chips.map((chip) => (
                                <Badge
                                    key={`${article._id}-${chip}`}
                                    variant="outline"
                                    className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
                                >
                                    {chip}
                                </Badge>
                            ))}
                        </div>

                        <div className="hidden items-center gap-1 sm:flex">
                            <Button variant="ghost" size="icon-sm" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Bookmark />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Share2 />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Ellipsis />
                            </Button>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold leading-tight text-slate-950 transition-colors duration-300 group-hover:text-slate-900 md:text-4xl md:leading-tight">
                        {article.title}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formattedDate}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Globe2 className="h-3.5 w-3.5" />
                            {getSourceHostLabel(article.source)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {getFreshnessLabel(article.publishedAt)}
                        </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600 md:text-lg">
                        {article.summary}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-700">
                            <span className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Exam Relevance</span>
                            {article.examRelevance}
                        </div>
                        <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                        >
                            Read Full Story
                        </a>
                    </div>
                </div>

                <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-auto lg:w-[36%] lg:min-w-[290px]">
                    {article.imageUrl && !imageError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                            <Globe2 className="mb-2 h-12 w-12 opacity-60" />
                            <span className="text-sm font-medium">Image unavailable</span>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
