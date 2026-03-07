import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiService } from '../ai/ai.service';
import { DiscoverRepository } from './discover.repository';
import {
    CATEGORY_QUERIES,
    DiscoverCategory,
    NormalizedArticle,
    SearxngResult,
    FRESHNESS_THRESHOLD_HOURS,
    TRUSTED_DOMAINS
} from './discover.types';

@Injectable()
export class DiscoverService {
    private readonly logger = new Logger(DiscoverService.name);
    private readonly searxngBaseUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly aiService: AiService,
        private readonly discoverRepository: DiscoverRepository,
    ) {
        this.searxngBaseUrl = this.configService.get<string>('discover.searxngBaseUrl') ?? 'http://localhost:8080';
    }

    /**
     * Public method used by the Controller to fetch news for clients.
     */
    async getArticles(category?: DiscoverCategory, limit = 30) {
        return this.discoverRepository.findArticles(category, limit);
    }

    /**
     * Main orchestration method called by the Scheduler (Cron).
     * Iterates over all categories, fetches from SearXNG, normalizes,
     * scores, generates AI summaries, and saves to the DB.
     */
    async fetchAndStore(): Promise<void> {
        this.logger.log('Starting automated Discover feed refresh...');

        for (const [categoryString, query] of Object.entries(CATEGORY_QUERIES)) {
            const category = categoryString as DiscoverCategory;

            this.logger.log(`Fetching category: ${category} ("${query}")`);

            try {
                const rawResults = await this.fetchFromSearxng(query);
                if (!rawResults || rawResults.length === 0) {
                    this.logger.warn(`No results returned for category: ${category}`);
                    continue;
                }

                const normalized = this.normalizeResults(rawResults, category);
                const deduped = this.deduplicateArticles(normalized);

                // Rank ALL articles first
                for (const article of deduped) {
                    article.rankScore = this.calculateRankScore(article);
                }

                // Sort by rank descending and take only top 10 to limit AI cost
                const TOP_N = 10;
                const topArticles = deduped
                    .sort((a, b) => b.rankScore - a.rankScore)
                    .slice(0, TOP_N);

                for (const article of topArticles) {
                    // Check if we already have this article by URL. If so, skip AI calls to save $.
                    const existing = await this.discoverRepository.findBySourceUrl(article.sourceUrl);
                    if (existing) continue;

                    // FIX 6: Image validation (HEAD request)
                    article.imageUrl = await this.validateImageUrl(article.imageUrl);

                    // FIX 3 & 4 & 8: AI Trust Verification (Two-Pass + Category match)
                    const isTrustworthy = await this.verifyArticleTrust(article);
                    if (!isTrustworthy) {
                        this.logger.debug(`Article rejected by AI Trust Layer: ${article.sourceUrl}`);
                        continue;
                    }

                    // Generate summaries + exam relevance using AiService
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

        this.logger.log('Completed automated Discover feed refresh.');
    }

    /**
     * Direct HTTP fetch to the private SearXNG instance.
     */
    private async fetchFromSearxng(query: string): Promise<SearxngResult[]> {
        const fetchPage = async (page: number) => {
            const url = new URL('/search', this.searxngBaseUrl);
            url.searchParams.set('q', query);
            url.searchParams.set('format', 'json');
            url.searchParams.set('language', 'en-US'); // Enforce English
            url.searchParams.set('pageno', page.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                this.logger.warn(`SearXNG HTTP Error on page ${page}: ${response.status}`);
                return [];
            }
            const data = await response.json();
            return (data.results || []) as SearxngResult[];
        };

        // Fetch 2 pages to ensure we get ~20 results before deduplication
        const [page1, page2] = await Promise.all([fetchPage(1), fetchPage(2)]);
        return [...page1, ...page2];
    }

    private normalizeResults(raw: SearxngResult[], category: DiscoverCategory): NormalizedArticle[] {
        return raw
            .filter(item => this.isArticleFresh(item.publishedDate))
            .filter(item => this.isSourceTrusted(item.url))
            .map(item => {
                const cleanedTitle = this.cleanTitle(item.title, item.content);

                // Priority image extraction + HTML fallback
                let bestImage = item.img_src || item.thumbnail || item.image || item.og_image || null;
                if (!bestImage && item.content) {
                    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch && imgMatch[1]) {
                        bestImage = imgMatch[1];
                    }
                }

                return {
                    title: cleanedTitle,
                    summary: item.content, // Temporary raw snippet; replaced later by AI
                    source: item.engine || new URL(item.url).hostname.replace('www.', ''),
                    sourceUrl: item.url,
                    imageUrl: bestImage,
                    category,
                    publishedAt: item.publishedDate ? new Date(item.publishedDate) : new Date(),
                    rankScore: 0,
                };
            });
    }

    /**
     * FIX 1: Reject old or dating-missing articles
     */
    private isArticleFresh(publishedDateString?: string): boolean {
        if (!publishedDateString) return false;
        const publishedDate = new Date(publishedDateString);
        if (isNaN(publishedDate.getTime())) return false;

        const now = new Date();
        const diffHours = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= FRESHNESS_THRESHOLD_HOURS;
    }

    /**
     * FIX 2: Allow only trusted domains
     */
    private isSourceTrusted(url: string): boolean {
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
            return TRUSTED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
        } catch {
            return false;
        }
    }

    /**
     * FIX 6: Validate image URLs natively via HTTP HEAD
     */
    private async validateImageUrl(url: string | null): Promise<string | null> {
        if (!url) return null;
        if (url.startsWith('data:')) return url;

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
     * FIX 3 & STEP 2: Clean generic titles before saving.
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
        ];

        for (const phrase of noisePhrases) {
            cleaned = cleaned.replace(phrase, '').trim();
        }

        // Clean up trailing separators if any remain
        cleaned = cleaned.replace(/[\s|\-]+$/, '').trim();

        // If title becomes too short (less than 5 words), try to use first sentence of the snippet
        const wordCount = cleaned.split(/\s+/).length;
        if (wordCount < 5 && snippet) {
            // Strip HTML tags from snippet first
            const plainSnippet = snippet.replace(/<[^>]*>?/gm, '');
            const match = plainSnippet.match(/[^.!?]+[.!?]/);
            if (match && match[0].split(/\s+/).length >= 5) {
                cleaned = match[0].trim();
            }
        }

        // Final fallback if absolutely everything fails
        return cleaned.length > 0 ? cleaned : "Important Update in Current Affairs";
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

    private calculateRankScore(article: NormalizedArticle): number {
        let score = 50; // Base score

        // Freshness (Granular tiers)
        const now = new Date();
        const diffHours = (now.getTime() - article.publishedAt.getTime()) / (1000 * 60 * 60);
        if (diffHours < 6) score += 30;
        else if (diffHours < 24) score += 20;
        else if (diffHours < 48) score += 10;
        else score -= 10; // Penalty for old news

        // Penalty for missing image (makes feed look bad)
        if (!article.imageUrl) {
            score -= 15;
        }

        // Title clarity bonus (penalize extremely short titles or generic ones)
        const wordCount = article.title.split(/\s+/).length;
        if (wordCount >= 6 && wordCount <= 15) {
            score += 10; // Goldilocks zone for headlines
        } else if (wordCount < 5) {
            score -= 10;
        }

        // Source credibility bonus (all are trusted at this point, but can scale later)
        if (TRUSTED_DOMAINS.some(ts => article.source.toLowerCase().includes(ts))) {
            score += 15;
        }

        return score;
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
     * FIX 3 & 4 & 8: AI Trust Verification (Two-Pass Logic + Category Match)
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
5. (Self-Challenge) Would an IAS or SSC aspirant genuinely find this important for their exam preparation, or is it just generic noise?

Based on your harsh editorial evaluation, decide if it should be published.
Respond with ONLY "APPROVE" or "REJECT". No other text.`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You are a flawless editorial gateway.' },
                { role: 'user', content: prompt }
            ], 'gpt-4o-mini'); // Can be slightly lighter model to save costs, but 4o-mini is standard

            return result.content?.trim().toUpperCase() === 'APPROVE';
        } catch (error) {
            // Fail-safe: if AI check fails entirely, reject to preserve trust
            return false;
        }
    }
}
