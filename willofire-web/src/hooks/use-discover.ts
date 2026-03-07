import { useQuery } from '@tanstack/react-query';
import { discoverApi, BackendCategory } from '@/lib/api/discover';

export const DISCOVER_QUERY_KEY = ['discover-articles'] as const;

/**
 * Custom hook to fetch discover articles.
 * Includes a periodic refresh so the feed stays updated while the user has the tab open.
 */
export const useDiscoverArticles = (category?: string, limit: number = 30) => {
    return useQuery({
        queryKey: [...DISCOVER_QUERY_KEY, category, limit],
        queryFn: () => discoverApi.getArticles(category, limit),
        // Refresh feed every 5 minutes in background
        refetchInterval: 5 * 60 * 1000,
        staleTime: 60 * 1000,
    });
};
