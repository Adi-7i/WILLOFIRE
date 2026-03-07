'use client';

import { useState } from 'react';
import { Bookmark, Ellipsis, Globe2, Share2 } from 'lucide-react';
import { DiscoverArticle } from '@/lib/api/discover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDiscoverCategory, getFreshnessLabel, getSourceHostLabel, getTopicChips } from './discover.utils';

interface ArticleCardProps {
    article: DiscoverArticle;
    isTrending?: boolean;
}

export function ArticleCard({ article, isTrending = false }: ArticleCardProps) {
    const [imageError, setImageError] = useState(false);
    const chips = getTopicChips(article);

    return (
        <article className="group h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
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
                            <Globe2 className="mb-2 h-10 w-10 opacity-60" />
                            <span className="text-xs font-medium">No preview image</span>
                        </div>
                    )}

                    {isTrending && (
                        <Badge className="absolute left-3 top-3 rounded-full border-0 bg-rose-100 text-rose-700 hover:bg-rose-100">
                            Trending
                        </Badge>
                    )}
                </div>
            </a>

            <div className="flex h-[220px] flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600">
                        {formatDiscoverCategory(article.category)}
                    </Badge>
                    {chips.slice(0, 1).map((chip) => (
                        <Badge key={`${article._id}-${chip}`} variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
                            {chip}
                        </Badge>
                    ))}
                </div>

                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-700">
                        {article.title}
                    </h3>
                </a>

                <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{article.summary}</p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                        <p className="text-xs font-medium text-slate-500">{getSourceHostLabel(article.source)}</p>
                        <p className="text-xs text-slate-400">{getFreshnessLabel(article.publishedAt)}</p>
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
            </div>
        </article>
    );
}
