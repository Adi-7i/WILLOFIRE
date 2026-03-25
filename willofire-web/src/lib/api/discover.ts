import { apiClient } from './client';

export type BackendCategory = 'todays-headlines' | 'economy' | 'polity' | 'international-relations' | 'science-tech' | 'environment' | 'defense';

export interface DiscoverArticle {
    _id: string;
    title: string;
    summary: string;
    source: string;
    sourceUrl: string;
    imageUrl: string | null;
    category: BackendCategory;
    publishedAt: string;
    examRelevance: string;
    rankScore: number;
    createdAt: string;
    updatedAt: string;
}

export const discoverApi = {
    getArticles: async (category?: BackendCategory, limit: number = 30): Promise<DiscoverArticle[]> => {
        const params: Record<string, string | number> = { limit };
        if (category) {
            params.category = category;
        }

        const response = await apiClient.get<DiscoverArticle[]>('/api/v1/discover', { params });
        return response.data;
    },
};
