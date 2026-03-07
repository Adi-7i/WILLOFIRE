'use client';

import { Calendar, Globe2 } from 'lucide-react';
import { DiscoverArticle } from '@/lib/api/discover';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FeaturedCardProps {
    article: DiscoverArticle;
}

export function FeaturedCard({ article }: FeaturedCardProps) {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(article.publishedAt));

    return (
        <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full"
        >
            <Card className="flex flex-col lg:flex-row h-full overflow-hidden transition-all hover:shadow-lg border-slate-200">
                {/* Image Block (takes 1/3 width on large screens) */}
                <div className="relative w-full lg:w-2/5 h-64 lg:h-auto bg-slate-100 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100">
                    {article.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <Globe2 className="h-12 w-12 mb-3 opacity-50" />
                            <span className="text-sm font-medium">No Image Available</span>
                        </div>
                    )}
                    {/* Floating Source Tag over image */}
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 border-0 shadow-sm px-3 py-1">
                            {article.source}
                        </Badge>
                    </div>
                </div>

                {/* Content Block */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-medium tracking-wide">
                        <span className="uppercase text-blue-600 font-bold">{article.category}</span>
                        <span>•</span>
                        <div className="flex items-center">
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            {formattedDate}
                        </div>
                    </div>

                    <h3 className="font-bold text-2xl leading-snug line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors mb-4">
                        {article.title}
                    </h3>

                    <p className="text-base text-slate-600 line-clamp-3 mb-6 flex-1">
                        {article.summary}
                    </p>

                    {/* Prominent Exam Relevance Block */}
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mt-auto">
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Exam Relevance
                        </p>
                        <p className="text-sm text-slate-800 font-medium">
                            {article.examRelevance}
                        </p>
                    </div>
                </div>
            </Card>
        </a>
    );
}
