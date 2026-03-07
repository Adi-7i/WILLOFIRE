'use client';

import { useState } from 'react';
import { Calendar, Globe2 } from 'lucide-react';
import { DiscoverArticle } from '@/lib/api/discover';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
    article: DiscoverArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
    const [imageError, setImageError] = useState(false);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(article.publishedAt));

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-slate-200">
            {/* Image Block */}
            <div className="relative w-full h-48 bg-slate-100 shrink-0">
                {article.imageUrl && !imageError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <Globe2 className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-sm font-medium">No Image Available</span>
                    </div>
                )}
            </div>

            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 shrink-0">
                        {article.category}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500 shrink-0">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formattedDate}
                    </div>
                </div>
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                </h3>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                    {article.summary}
                </p>

                {/* Exam Relevance Block */}
                <div className="bg-blue-50/50 rounded-md p-3 border border-blue-100 mt-auto">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-widest mb-1">
                        Exam Relevance
                    </p>
                    <p className="text-sm text-slate-700 italic">
                        {article.examRelevance}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                    {article.source}
                </div>
                <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                    Read Source
                    <span aria-hidden="true">&rarr;</span>
                </a>
            </CardFooter>
        </Card>
    );
}
