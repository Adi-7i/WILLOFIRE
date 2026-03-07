'use client';

import { useState } from 'react';
import { Bookmark, Ellipsis, Globe2, Share2 } from 'lucide-react';
import { DiscoverArticle } from '@/lib/api/discover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFreshnessLabel, getSourceHostLabel, getTopicChips, isTrendingArticle } from './discover.utils';

interface HorizontalArticleCardProps {
    article: DiscoverArticle;
    index: number;
}

export function HorizontalArticleCard({ article, index }: HorizontalArticleCardProps) {
    const [imageError, setImageError] = useState(false);
    const isReverse = index % 2 === 1;
    const chips = getTopicChips(article);
    const trending = isTrendingArticle(article, index + 4);

    return (
        <article
            className={`group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.09)]`}
        >
            <div className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100 lg:h-auto lg:w-[38%]"
                >
                    {article.imageUrl && !imageError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                            <Globe2 className="mb-2 h-12 w-12 opacity-60" />
                            <span className="text-sm font-medium">Image unavailable</span>
                        </div>
                    )}
                </a>

                <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {trending && (
                                <Badge className="rounded-full border-0 bg-rose-100 text-rose-700 hover:bg-rose-100">
                                    Trending
                                </Badge>
                            )}
                            {chips.map((chip) => (
                                <Badge key={`${article._id}-${chip}`} variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
                                    {chip}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-xs" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Bookmark />
                            </Button>
                            <Button variant="ghost" size="icon-xs" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Share2 />
                            </Button>
                            <Button variant="ghost" size="icon-xs" className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                <Ellipsis />
                            </Button>
                        </div>
                    </div>

                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-slate-700">
                            {article.title}
                        </h3>
                    </a>

                    <p className="mt-3 line-clamp-3 text-base leading-relaxed text-slate-600">{article.summary}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="font-medium text-slate-600">{getSourceHostLabel(article.source)}</span>
                        <span className="text-slate-300">•</span>
                        <span>{getFreshnessLabel(article.publishedAt)}</span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-700">
                        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Exam Relevance</span>
                        {article.examRelevance}
                    </div>
                </div>
            </div>
        </article>
    );
}
