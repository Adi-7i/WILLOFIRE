import { useQuery } from '@tanstack/react-query';
import { discoverApi, BackendCategory } from '@/lib/api/discover';

export const DISCOVER_QUERY_KEY = ['discover-articles'] as const;

export const useDiscoverArticles = (category?: BackendCategory, limit: number = 30) => {
    return useQuery({
        queryKey: [...DISCOVER_QUERY_KEY, category, limit],
        queryFn: () => discoverApi.getArticles(category, limit),
    });
};
