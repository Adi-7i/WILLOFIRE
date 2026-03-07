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
    [DiscoverCategory.ECONOMY]: 'india economy inflation gdp rbi policy latest news',
    [DiscoverCategory.POLITY]: 'supreme court constitution law india latest decision',
    [DiscoverCategory.INTERNATIONAL_RELATIONS]: 'india diplomacy international relations geopolitics summit',
    [DiscoverCategory.SCIENCE_TECH]: 'science technology breakthrough ai research space launch',
    [DiscoverCategory.ENVIRONMENT]: 'climate change biodiversity environment policy india',
    [DiscoverCategory.DEFENSE]: 'india military defense missile security strategy',
};

export const FRESHNESS_THRESHOLD_HOURS = 72;

export const TRUSTED_DOMAINS = [
    'reuters.com',
    'apnews.com',
    'bbc.com',
    'thehindu.com',
    'indianexpress.com',
    'livemint.com',
    'business-standard.com',
    'pib.gov.in',
    'prsindia.org',
    'isro.gov.in',
];
