export enum DiscoverCategory {
    TODAYS_HEADLINES = 'todays-headlines',
    ECONOMY = 'economy',
    POLITY = 'polity',
    INTERNATIONAL_RELATIONS = 'international-relations',
    SCIENCE_TECH = 'science-tech',
    ENVIRONMENT = 'environment',
    DEFENSE = 'defense',
}

export interface SearxngResult {
    title: string;
    url: string;
    content: string;
    img_src?: string;
    thumbnail?: string;
    image?: string;
    publishedDate?: string;
    engine: string;
    parsed_url: string[];
    template: string;
    engines: string[];
    positions: number[];
    score: number;
    category: string;
}

export interface NormalizedArticle {
    title: string;
    summary: string;
    source: string;
    sourceUrl: string;
    imageUrl: string | null;
    category: DiscoverCategory;
    publishedAt: Date;
    rankScore: number;
}

export const CATEGORY_QUERIES: Partial<Record<DiscoverCategory, string>> = {
    // TODAYS_HEADLINES intentionally omitted, as it's aggregated from top articles, not searched directly in SearXNG
    [DiscoverCategory.ECONOMY]: 'india economy current affairs',
    [DiscoverCategory.POLITY]: 'constitution supreme court india latest',
    [DiscoverCategory.INTERNATIONAL_RELATIONS]: 'diplomacy india global affairs',
    [DiscoverCategory.SCIENCE_TECH]: 'science technology india latest',
    [DiscoverCategory.ENVIRONMENT]: 'climate biodiversity india latest',
    [DiscoverCategory.DEFENSE]: 'defense military strategic affairs india latest',
};
