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

export const CATEGORY_SOURCE_POOLS: Record<DiscoverCategory, readonly string[]> = {
    [DiscoverCategory.ECONOMY]: [
        'livemint.com',
        'business-standard.com',
        'reuters.com',
        'thehindu.com',
    ],
    [DiscoverCategory.POLITY]: [
        'thehindu.com',
        'indianexpress.com',
        'prsindia.org',
        'pib.gov.in',
    ],
    [DiscoverCategory.INTERNATIONAL_RELATIONS]: [
        'reuters.com',
        'bbc.com',
        'apnews.com',
        'thehindu.com',
    ],
    [DiscoverCategory.SCIENCE_TECH]: [
        'nature.com',
        'science.org',
        'isro.gov.in',
        'reuters.com',
    ],
    [DiscoverCategory.ENVIRONMENT]: [
        'downtoearth.org.in',
        'unep.org',
        'thehindu.com',
        'reuters.com',
    ],
    [DiscoverCategory.DEFENSE]: [
        'thehindu.com',
        'indianexpress.com',
        'reuters.com',
    ],
    [DiscoverCategory.TODAYS_HEADLINES]: [
        'bbc.com',
        'reuters.com',
        'apnews.com',
        'thehindu.com',
    ],
};

export const FRESHNESS_THRESHOLD_HOURS = 72;

export const CATEGORY_TARGET_QUERIES: Record<DiscoverCategory, readonly string[]> = {
    [DiscoverCategory.ECONOMY]: [
        'inflation outlook',
        'rbi policy',
        'fiscal deficit',
        'gdp growth',
    ],
    [DiscoverCategory.POLITY]: [
        'supreme court judgment',
        'parliament bill',
        'constitutional amendment',
        'governance policy',
    ],
    [DiscoverCategory.INTERNATIONAL_RELATIONS]: [
        'india bilateral talks',
        'strategic partnership',
        'summit outcome',
        'geopolitics development',
    ],
    [DiscoverCategory.SCIENCE_TECH]: [
        'AI breakthrough',
        'space mission',
        'scientific discovery',
        'technology research',
    ],
    [DiscoverCategory.ENVIRONMENT]: [
        'climate policy',
        'biodiversity conservation',
        'environment regulation',
        'pollution control',
    ],
    [DiscoverCategory.DEFENSE]: [
        'india missile',
        'military modernization',
        'defense policy',
    ],
    [DiscoverCategory.TODAYS_HEADLINES]: [
        'major development',
        'policy update',
        'global affairs',
        'india update',
    ],
};

export const SEARXNG_ENGINE = 'bing news';
export const SEARXNG_PAGE_BATCH_COUNT = 2;
export const MAX_AI_VALIDATION_CANDIDATES = 20;
export const MAX_STORED_ARTICLES_PER_CATEGORY = 10;

export const NON_NEWS_PATTERNS: readonly RegExp[] = [
    /\bpartner content\b/i,
    /\bsponsored\b/i,
    /\bfeature article\b/i,
    /\bevergreen explainer\b/i,
    /\barchive\b/i,
    /\bresearch archive\b/i,
    /\bstatic report\b/i,
    /\/archive\//i,
    /\/static\//i,
    /\/reports?\//i,
];

const trustedDomainSet = new Set<string>();
for (const domains of Object.values(CATEGORY_SOURCE_POOLS)) {
    for (const domain of domains) {
        trustedDomainSet.add(domain);
    }
}

export const TRUSTED_DOMAINS = Array.from(trustedDomainSet);
