export enum DiscoverCategory {
    INDIA = 'india',
    WORLD = 'world',
    ECONOMY = 'economy',
    SCIENCE = 'science',
    INTERNATIONAL = 'international',
}

export interface SearxngResult {
    title: string;
    url: string;
    content: string;
    img_src?: string;
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

export const CATEGORY_QUERIES: Record<DiscoverCategory, string> = {
    [DiscoverCategory.INDIA]: 'latest news india',
    [DiscoverCategory.WORLD]: 'latest world news',
    [DiscoverCategory.ECONOMY]: 'latest economy news',
    [DiscoverCategory.SCIENCE]: 'latest science technology news',
    [DiscoverCategory.INTERNATIONAL]: 'latest international affairs news',
};
