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
    og_image?: string;
    publishedDate?: string;
    published_date?: string;
    published_at?: string;
    published?: string;
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
