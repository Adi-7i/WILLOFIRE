import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function ArticleSkeleton() {
    return (
        <Card className="flex h-[460px] flex-col overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-slate-100 animate-pulse shrink-0" />

            <CardHeader className="p-4 pb-2 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="h-5 w-20 bg-slate-200 animate-pulse rounded-full" />
                    <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                </div>
                {/* Title Skeletons */}
                <div className="space-y-2">
                    <div className="h-5 bg-slate-200 animate-pulse rounded w-full" />
                    <div className="h-5 bg-slate-200 animate-pulse rounded w-3/4" />
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                {/* Summary Skeletons */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-4/5" />
                </div>

                {/* Exam Relevance Skeleton */}
                <div className="bg-slate-50 rounded-md p-3 border border-slate-100 mt-auto space-y-2">
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-24" />
                    <div className="h-4 bg-slate-200 animate-pulse rounded w-full" />
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
            </CardFooter>
        </Card>
    );
}
