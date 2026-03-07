import { DiscoverArticle } from '@/lib/api/discover';

const GENERIC_TITLE_PATTERNS: readonly RegExp[] = [
    /latest news/i,
    /breaking news/i,
    /google news/i,
    /world news/i,
    /^news$/i,
    /^headlines$/i,
    /^top stories$/i,
];

export const DISCOVER_CATEGORY_LABELS: Record<DiscoverArticle['category'], string> = {
    'todays-headlines': "Today's Headlines",
    economy: 'Economy',
    polity: 'Polity',
    'international-relations': 'International Relations',
    'science-tech': 'Science & Tech',
    environment: 'Environment',
    defense: 'Defense',
};

export function formatDiscoverCategory(category: DiscoverArticle['category']): string {
    return DISCOVER_CATEGORY_LABELS[category] ?? category;
}

export function isGenericTitle(title: string): boolean {
    const normalized = title.trim();
    if (!normalized) return true;
    return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getHoursSincePublished(publishedAt: string): number | null {
    const publishedTs = new Date(publishedAt).getTime();
    if (Number.isNaN(publishedTs)) return null;

    const diff = Date.now() - publishedTs;
    if (diff < 0) return null;
    return diff / (1000 * 60 * 60);
}

export function getFreshnessLabel(publishedAt: string): string {
    const hours = getHoursSincePublished(publishedAt);
    if (hours === null) return 'Date unavailable';
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function getSourceHostLabel(source: string): string {
    if (!source) return 'Unknown source';
    return source.replace(/^www\./i, '');
}

export function isArticleRenderable(article: DiscoverArticle): boolean {
    if (!article.title || !article.summary || !article.examRelevance) return false;
    if (!article.sourceUrl || !/^https?:\/\//i.test(article.sourceUrl)) return false;
    if (isGenericTitle(article.title)) return false;

    const freshnessHours = getHoursSincePublished(article.publishedAt);
    return freshnessHours !== null && freshnessHours <= 72;
}

type TopicChip = 'AI' | 'Startup' | 'Tech' | 'Business' | 'Global';

function hasAnyKeyword(text: string, keywords: readonly string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
}

export function getTopicChips(article: DiscoverArticle): TopicChip[] {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    const chips: TopicChip[] = [];

    if (hasAnyKeyword(text, ['artificial intelligence', 'llm', 'machine learning', 'neural']) || /\bai\b/i.test(text)) {
        chips.push('AI');
    }

    if (hasAnyKeyword(text, ['startup', 'funding', 'venture', 'seed round', 'valuation'])) {
        chips.push('Startup');
    }

    if (article.category === 'science-tech' || hasAnyKeyword(text, ['technology', 'chip', 'software', 'platform'])) {
        chips.push('Tech');
    }

    if (article.category === 'economy' || hasAnyKeyword(text, ['economy', 'gdp', 'market', 'inflation', 'trade', 'policy'])) {
        chips.push('Business');
    }

    if (article.category === 'international-relations' || article.category === 'todays-headlines' || hasAnyKeyword(text, ['global', 'international', 'diplomacy', 'summit'])) {
        chips.push('Global');
    }

    if (chips.length === 0) {
        chips.push(article.category === 'science-tech' ? 'Tech' : 'Global');
    }

    return chips.slice(0, 3);
}

export function isTrendingArticle(article: DiscoverArticle, position: number): boolean {
    return position === 0 || article.rankScore >= 95;
}
