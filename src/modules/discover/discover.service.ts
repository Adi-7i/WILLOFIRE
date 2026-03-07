import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiService } from '../ai/ai.service';
import { DiscoverRepository } from './discover.repository';
import {
    CATEGORY_SOURCE_POOLS,
    CATEGORY_TARGET_QUERIES,
    DiscoverCategory,
    FRESHNESS_THRESHOLD_HOURS,
    MAX_AI_VALIDATION_CANDIDATES,
    MAX_STORED_ARTICLES_PER_CATEGORY,
    NON_NEWS_PATTERNS,
    NormalizedArticle,
    SearxngResult,
    SEARXNG_ENGINE,
    SEARXNG_PAGE_BATCH_COUNT,
    TRUSTED_DOMAINS,
} from './discover.types';

@Injectable()
export class DiscoverService {
    private readonly logger = new Logger(DiscoverService.name);
    private readonly searxngBaseUrl: string;
    private readonly isProduction: boolean;
    private readonly fetchConcurrency = 6;
    private readonly searxngRequestTimeoutMs = 8_000;

    constructor(
        private readonly configService: ConfigService,
        private readonly aiService: AiService,
        private readonly discoverRepository: DiscoverRepository,
    ) {
        this.searxngBaseUrl = this.configService.get<string>('discover.searxngBaseUrl') ?? 'http://localhost:8080';
        this.isProduction = this.configService.get<boolean>('app.isProduction') ?? process.env.NODE_ENV === 'production';
    }

    /**
     * Public method used by the Controller to fetch news for clients.
     */
    async getArticles(category?: DiscoverCategory, limit = 30) {
        const fetchLimit = Math.max(limit * 2, limit);
        const articles = await this.discoverRepository.findArticles(category, fetchLimit);

        return articles
            .filter(article => this.isPersistedArticleSafe(
                article.title,
                article.publishedAt,
                article.imageUrl,
            ))
            .slice(0, limit);
    }

    /**
     * Main orchestration method called by the Scheduler (Cron).
     * Iterates over all categories, fetches from SearXNG, normalizes,
     * scores, generates AI summaries, and saves to the DB.
     */
    async fetchAndStore(): Promise<void> {
        this.logVerbose('Starting automated Discover feed refresh...');

        for (const category of Object.values(DiscoverCategory)) {
            const targetedQueries = this.buildTargetedQueries(category);
            this.logVerbose(`Fetching category: ${category} (${targetedQueries.length} targeted queries)`);

            try {
                if (targetedQueries.length === 0) {
                    this.logger.warn(`No targeted queries configured for category: ${category}`);
                    continue;
                }

                const rawResults = await this.fetchTargetedResults(targetedQueries);
                if (!rawResults || rawResults.length === 0) {
                    this.logger.warn(`No results returned for category: ${category}`);
                    continue;
                }

                const dedupedRaw = this.deduplicateRawResults(rawResults);
                const normalized = await this.normalizeResults(dedupedRaw, category);
                const deduped = this.deduplicateArticles(normalized);

                const aiCandidates = deduped
                    .sort((a, b) => this.calculatePreAiRankScore(b, category) - this.calculatePreAiRankScore(a, category))
                    .slice(0, MAX_AI_VALIDATION_CANDIDATES);

                const approvedArticles: NormalizedArticle[] = [];

                for (const article of aiCandidates) {
                    // Check if we already have this article by URL. If so, skip AI calls to save $.
                    const existing = await this.discoverRepository.findBySourceUrl(article.sourceUrl);
                    if (existing) continue;

                    const isTrustworthy = await this.verifyArticleTrust(article);
                    if (!isTrustworthy) {
                        this.logDebug(`Article rejected by AI trust layer: ${article.sourceUrl}`);
                        continue;
                    }

                    const isExamRelevant = await this.verifyAspirantBenefit(article);
                    if (!isExamRelevant) {
                        this.logDebug(`Article rejected by AI self-challenge: ${article.sourceUrl}`);
                        continue;
                    }

                    if (!this.passesNoImageExceptionPolicy(article)) {
                        this.logDebug(`Article rejected due to no-image policy: ${article.sourceUrl}`);
                        continue;
                    }

                    article.rankScore = this.calculateRankScore(article, category, isExamRelevant);
                    approvedArticles.push(article);
                }

                const topArticles = approvedArticles
                    .sort((a, b) => b.rankScore - a.rankScore)
                    .slice(0, MAX_STORED_ARTICLES_PER_CATEGORY);

                for (const article of topArticles) {
                    const [summary, examRelevance] = await Promise.all([
                        this.generateSummary(article),
                        this.generateExamRelevance(article),
                    ]);

                    // Store it
                    await this.discoverRepository.upsertArticle({
                        ...article,
                        summary,
                        examRelevance,
                    });
                }
            } catch (error) {
                this.logger.error(`Error processing category ${category}: ${(error as Error).message}`, (error as Error).stack);
                // Continue to the next category even if one fails
            }
        }

        this.logVerbose('Completed automated Discover feed refresh.');
    }

    /**
     * Direct HTTP fetch to the private SearXNG instance.
     */
    private async fetchFromSearxng(query: string, pages = SEARXNG_PAGE_BATCH_COUNT): Promise<SearxngResult[]> {
        const fetchPage = async (page: number) => {
            const url = new URL('/search', this.searxngBaseUrl);
            url.searchParams.set('q', query);
            url.searchParams.set('format', 'json');
            url.searchParams.set('language', 'en-US'); // Enforce English
            url.searchParams.set('engines', SEARXNG_ENGINE);
            url.searchParams.set('pageno', page.toString());

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.searxngRequestTimeoutMs);
            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    this.logger.warn(`SearXNG HTTP error for query "${this.shortenQueryForLogs(query)}" page ${page}: ${response.status}`);
                    return [];
                }

                const data = await response.json() as { results?: SearxngResult[] };
                return (data.results || []) as SearxngResult[];
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(`SearXNG fetch failure for query "${this.shortenQueryForLogs(query)}" page ${page}: ${message}`);
                return [];
            } finally {
                clearTimeout(timeoutId);
            }
        };

        const pagePromises: Array<Promise<SearxngResult[]>> = [];
        for (let page = 1; page <= pages; page += 1) {
            pagePromises.push(fetchPage(page));
        }

        const pageResults = await Promise.all(pagePromises);
        return pageResults.flat();
    }

    private buildTargetedQueries(category: DiscoverCategory): string[] {
        const sourcePool = CATEGORY_SOURCE_POOLS[category] ?? [];
        const categoryQueries = CATEGORY_TARGET_QUERIES[category] ?? [];

        return sourcePool.flatMap(domain =>
            categoryQueries.map(keyword => `site:${domain} ${keyword}`),
        );
    }

    private async fetchTargetedResults(targetedQueries: string[]): Promise<SearxngResult[]> {
        const allResults: SearxngResult[] = [];

        for (let index = 0; index < targetedQueries.length; index += this.fetchConcurrency) {
            const batch = targetedQueries.slice(index, index + this.fetchConcurrency);
            const settledResults = await Promise.allSettled(batch.map(query => this.fetchFromSearxng(query)));

            for (let resultIndex = 0; resultIndex < settledResults.length; resultIndex += 1) {
                const settled = settledResults[resultIndex];
                if (settled.status === 'fulfilled') {
                    allResults.push(...settled.value);
                    continue;
                }

                const failedQuery = batch[resultIndex] ?? 'unknown query';
                const reason = settled.reason instanceof Error ? settled.reason.message : 'Unknown error';
                this.logger.warn(`SearXNG batch failure for query "${this.shortenQueryForLogs(failedQuery)}": ${reason}`);
            }
        }

        return allResults;
    }

    private shortenQueryForLogs(query: string): string {
        const MAX = 80;
        if (query.length <= MAX) {
            return query;
        }
        return `${query.slice(0, MAX)}...`;
    }

    private async normalizeResults(raw: SearxngResult[], category: DiscoverCategory): Promise<NormalizedArticle[]> {
        const candidates = raw
            .filter(item => this.isSourceTrusted(item.url))
            .filter(item => !this.isNonNewsArticleType(item))
            .filter(item => this.isArticleFresh(this.extractPublishedDate(item)));

        const normalized = await Promise.all(
            candidates.map(async item => {
                const sourceDomain = this.extractDomain(item.url);
                const publishedAt = this.extractPublishedDate(item);
                if (!sourceDomain || !publishedAt) {
                    return null;
                }

                const cleanSummary = this.stripHtml(item.content ?? '').trim();
                const cleanedTitle = this.cleanTitle(item.title ?? '', cleanSummary);
                if (!cleanedTitle || this.isGenericTitle(cleanedTitle)) {
                    return null;
                }

                const bestImageCandidate = this.extractBestImage(item);
                const imageUrl = await this.validateImageUrl(bestImageCandidate);
                if (!imageUrl && !this.isHeadlineExtremelyStrong(cleanedTitle)) {
                    return null;
                }

                return {
                    title: cleanedTitle,
                    summary: cleanSummary,
                    source: sourceDomain,
                    sourceUrl: this.normalizeUrl(item.url),
                    imageUrl,
                    category,
                    publishedAt,
                    rankScore: 0,
                } satisfies NormalizedArticle;
            }),
        );

        return normalized.filter((article): article is NormalizedArticle => article !== null);
    }

    /**
     * Reject old or date-missing articles.
     */
    private isArticleFresh(publishedDateInput?: Date | string | null): boolean {
        if (!publishedDateInput) return false;
        const publishedDate = new Date(publishedDateInput);
        if (isNaN(publishedDate.getTime())) return false;

        const now = new Date();
        const diffHours = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= FRESHNESS_THRESHOLD_HOURS;
    }

    /**
     * Allow only trusted domains.
     */
    private isSourceTrusted(url: string): boolean {
        try {
            const hostname = this.extractDomain(url);
            if (!hostname) return false;
            return TRUSTED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
        } catch {
            return false;
        }
    }

    /**
     * Validate image URLs natively via HTTP HEAD.
     */
    private async validateImageUrl(url: string | null): Promise<string | null> {
        if (!url) return null;
        if (!/^https?:\/\//i.test(url)) return null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
                return url;
            }
            return null;
        } catch (error) {
            return null; // Network error or timeout -> assume broken
        }
    }

    /**
     * Clean generic titles before saving.
     * Removes noisy strings and falls back to snippet sentence if title is weak.
     */
    private cleanTitle(rawTitle: string, snippet: string): string {
        let cleaned = rawTitle.trim();

        // Specific targeted source removal
        const noisePhrases = [
            /latest news/gi,
            /breaking news/gi,
            /today's news/gi,
            /google news/gi,
            /world news/gi,
            /india news/gi,
            /\|\s*BBC.*/gi,
            /\|\s*CNN.*/gi,
            /\|\s*Reuters.*/gi,
            /\|\s*The Hindu.*/gi,
            /\|\s*Times of India.*/gi,
            /\|\s*Indian Express.*/gi,
            /-\s*BBC.*/gi,
            /-\s*CNN.*/gi,
            /-\s*Reuters.*/gi,
            /-\s*The Hindu.*/gi,
            /-\s*Times of India.*/gi,
            /-\s*Indian Express.*/gi,
            /\|\s*Google News.*/gi,
            /-\s*Google News.*/gi,
        ];

        for (const phrase of noisePhrases) {
            cleaned = cleaned.replace(phrase, '').trim();
        }

        // Clean up trailing separators if any remain
        cleaned = cleaned.replace(/[\s|\-]+$/, '').trim();

        // If title becomes too short (less than 5 words), try to use first sentence of the snippet
        const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
        if (wordCount < 5 && snippet) {
            const match = snippet.match(/[^.!?]+[.!?]/);
            if (match && match[0].split(/\s+/).length >= 5) {
                cleaned = match[0].trim();
            }
        }

        return cleaned.length > 0 ? cleaned : 'Important update in current affairs';
    }

    private isGenericTitle(title: string): boolean {
        const weakTitlePatterns = [
            /latest news/i,
            /breaking news/i,
            /google news/i,
            /world news/i,
            /^news$/i,
            /^headlines$/i,
            /^top stories$/i,
        ];

        return weakTitlePatterns.some(pattern => pattern.test(title.trim()));
    }

    private isHeadlineExtremelyStrong(title: string): boolean {
        const wordCount = title.split(/\s+/).filter(Boolean).length;
        return wordCount >= 8 && wordCount <= 18 && !this.isGenericTitle(title);
    }

    private extractPublishedDate(item: SearxngResult): Date | null {
        const rawDate = item.publishedDate ?? item.published_date ?? item.published_at ?? item.published;
        if (!rawDate) {
            return null;
        }

        const parsed = new Date(rawDate);
        if (isNaN(parsed.getTime())) {
            return null;
        }

        return parsed;
    }

    private extractBestImage(item: SearxngResult): string | null {
        return item.thumbnail || item.img_src || item.image || item.og_image || null;
    }

    private stripHtml(content: string): string {
        return content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    }

    private isNonNewsArticleType(item: SearxngResult): boolean {
        const combinedText = `${item.title ?? ''} ${item.content ?? ''} ${item.url ?? ''}`.toLowerCase();
        return NON_NEWS_PATTERNS.some(pattern => pattern.test(combinedText));
    }

    private passesNoImageExceptionPolicy(article: NormalizedArticle): boolean {
        if (article.imageUrl) {
            return true;
        }

        return this.isHeadlineExtremelyStrong(article.title);
    }

    private deduplicateRawResults(results: SearxngResult[]): SearxngResult[] {
        const unique = new Map<string, SearxngResult>();

        for (const item of results) {
            const normalizedUrl = this.normalizeUrl(item.url);
            if (!unique.has(normalizedUrl)) {
                unique.set(normalizedUrl, item);
            }
        }

        return Array.from(unique.values());
    }

    private normalizeUrl(url: string): string {
        try {
            const parsed = new URL(url);
            parsed.hash = '';

            // Drop common tracking params to avoid duplicate URLs for same article.
            const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid'];
            for (const param of trackingParams) {
                parsed.searchParams.delete(param);
            }

            const normalizedPath = parsed.pathname.length > 1
                ? parsed.pathname.replace(/\/+$/, '')
                : parsed.pathname;
            const normalizedHost = parsed.hostname.replace(/^www\./, '');

            return `${parsed.protocol}//${normalizedHost}${normalizedPath}${parsed.search}`;
        } catch {
            return url;
        }
    }

    private extractDomain(url: string): string | null {
        try {
            return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return null;
        }
    }

    private deduplicateArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
        const unique = new Map<string, NormalizedArticle>();

        // We use sourceUrl as the primary deduplication key.
        for (const article of articles) {
            // Keep the first one we see (usually highest ranked by search engine)
            if (!unique.has(article.sourceUrl)) {
                unique.set(article.sourceUrl, article);
            }
        }

        return Array.from(unique.values());
    }

    private calculatePreAiRankScore(article: NormalizedArticle, category: DiscoverCategory): number {
        let score = 0;
        score += this.calculateFreshnessScore(article.publishedAt);
        score += this.calculateSourceTrustScore(article, category);
        score += this.calculateHeadlineClarityScore(article.title);
        score += article.imageUrl ? 15 : -12;
        return score;
    }

    private calculateRankScore(article: NormalizedArticle, category: DiscoverCategory, isExamRelevant: boolean): number {
        let score = 0;

        score += this.calculateFreshnessScore(article.publishedAt);
        score += this.calculateSourceTrustScore(article, category);
        score += this.calculateHeadlineClarityScore(article.title);
        score += this.calculateExamRelevanceSignalScore(article, category);
        score += isExamRelevant ? 25 : -25;
        score += article.imageUrl ? 10 : -10;

        return score;
    }

    private calculateFreshnessScore(publishedAt: Date): number {
        const now = new Date();
        const diffHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

        if (diffHours < 6) return 40;
        if (diffHours < 24) return 30;
        if (diffHours < 48) return 20;
        if (diffHours <= FRESHNESS_THRESHOLD_HOURS) return 10;
        return -30;
    }

    private calculateSourceTrustScore(article: NormalizedArticle, category: DiscoverCategory): number {
        const sourcePool = CATEGORY_SOURCE_POOLS[category] ?? [];
        if (sourcePool.some(domain => article.source === domain || article.source.endsWith(`.${domain}`))) {
            return 30;
        }

        if (TRUSTED_DOMAINS.some(domain => article.source === domain || article.source.endsWith(`.${domain}`))) {
            return 15;
        }

        return -20;
    }

    private calculateHeadlineClarityScore(title: string): number {
        const wordCount = title.split(/\s+/).filter(Boolean).length;
        if (this.isGenericTitle(title)) return -30;
        if (wordCount >= 8 && wordCount <= 16) return 20;
        if (wordCount >= 6 && wordCount <= 20) return 12;
        if (wordCount < 5) return -20;
        return 0;
    }

    private calculateExamRelevanceSignalScore(article: NormalizedArticle, category: DiscoverCategory): number {
        const categoryQueries = CATEGORY_TARGET_QUERIES[category] ?? [];
        const text = `${article.title} ${article.summary}`.toLowerCase();

        let matches = 0;
        for (const query of categoryQueries) {
            const queryTokens = query.toLowerCase().split(/\s+/).filter(token => token.length > 3);
            const hasSignal = queryTokens.some(token => text.includes(token));
            if (hasSignal) {
                matches += 1;
            }
        }

        return Math.min(matches * 6, 24);
    }

    private isPersistedArticleSafe(title: string, publishedAt: Date | string, imageUrl: string | null): boolean {
        if (!this.isArticleFresh(publishedAt)) {
            return false;
        }

        if (this.isGenericTitle(title)) {
            return false;
        }

        if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
            return true;
        }

        return this.isHeadlineExtremelyStrong(title);
    }

    private async generateSummary(article: NormalizedArticle): Promise<string> {
        try {
            // FIX 4: Use cleaned title + snippet for high-quality input
            const prompt = `Write a concise, factual, and clean 3-line summary of the following news snippet.\n\nTitle: ${article.title}\nSnippet: ${article.summary}\n\nRULES:\n- Max 3 short sentences.\n- Factual only. No clickbait.\n- Readable tone.`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You are an objective news summarizer.' },
                { role: 'user', content: prompt }
            ]);

            return result.content || article.summary; // Fallback to raw snippet if AI fails slightly
        } catch (error) {
            this.logger.warn(`AI Summary generation failed for ${article.sourceUrl}, falling back to snippet.`);
            return article.summary;
        }
    }

    private async generateExamRelevance(article: NormalizedArticle): Promise<string> {
        try {
            // FIX 7: Use cleaned title + snippet for high-precision topic modeling
            const prompt = `Based on the following news, output one short sentence stating its relevance to competitive exams (like UPSC, SSC).

Title: ${article.title}
Snippet: ${article.summary}

RULES:
- Format exactly like: "Relevant for [Specific Topic/Subtopic]." 
- Example: "Relevant for missile defense modernization and procurement policy."
- BAD Example: "Relevant for science and technology." (Too generic)
- Max 1 sentence. Make it extremely specific and professional.`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You are an exam curriculum expert mapping current affairs to subjects.' },
                { role: 'user', content: prompt }
            ]);

            return result.content || 'Relevant for current affairs.';
        } catch (error) {
            return 'Relevant for current affairs.';
        }
    }

    /**
     * AI Pass 1: Current + trusted + category-aligned editorial validation.
     */
    private async verifyArticleTrust(article: NormalizedArticle): Promise<boolean> {
        try {
            const prompt = `You are a strict editorial AI for a premium UPSC/SSC exam prep platform.
You must verify an article before it is shown to students.

Title: ${article.title}
Snippet: ${article.summary}
Expected Category: ${article.category}

Answer these questions silently:
1. Is this article genuinely current news (not historical context)?
2. Is the source likely a credible news outlet?
3. Is this article factual and free of clickbait?
4. Does this genuinely match the expected category '${article.category}'?

Based on your harsh editorial evaluation, decide if it should be published.
Respond with ONLY "APPROVE" or "REJECT". No other text.`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You are a flawless editorial gateway.' },
                { role: 'user', content: prompt }
            ]);

            return result.content?.trim().toUpperCase() === 'APPROVE';
        } catch (error) {
            // Fail-safe: if AI check fails entirely, reject to preserve trust
            return false;
        }
    }

    /**
     * AI Pass 2: Self-challenge for UPSC/SSC value.
     */
    private async verifyAspirantBenefit(article: NormalizedArticle): Promise<boolean> {
        try {
            const prompt = `You are a ruthless exam relevance reviewer.
Decide if this article is genuinely useful for UPSC/SSC aspirants.

Title: ${article.title}
Snippet: ${article.summary}
Category: ${article.category}

Reject generic lifestyle, evergreen explainers, promotional content, and weak updates.
Respond with ONLY "APPROVE" or "REJECT".`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You only approve high-value exam-relevant current affairs.' },
                { role: 'user', content: prompt },
            ]);

            return result.content?.trim().toUpperCase() === 'APPROVE';
        } catch (error) {
            return false;
        }
    }

    private logVerbose(message: string): void {
        if (!this.isProduction) {
            this.logger.log(message);
        }
    }

    private logDebug(message: string): void {
        if (!this.isProduction) {
            this.logger.debug(message);
        }
    }
}
