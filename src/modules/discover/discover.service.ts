import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiService } from '../ai/ai.service';
import { DiscoverRepository } from './discover.repository';
import {
    CATEGORY_QUERIES,
    DiscoverCategory,
    NormalizedArticle,
    SearxngResult,
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
        const url = new URL('/search', this.searxngBaseUrl);
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('language', 'en-US'); // Enforce English
        // You might want to constrain time to 24h depending on SearXNG config: url.searchParams.set('time_range', 'day');

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`SearXNG HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return (data.results || []) as SearxngResult[];
    }

    private normalizeResults(raw: SearxngResult[], category: DiscoverCategory): NormalizedArticle[] {
        return raw.map(item => {
            const cleanedTitle = this.cleanTitle(item.title, item.content);
            return {
                title: cleanedTitle,
                summary: item.content, // Temporary raw snippet; replaced later by AI
                source: item.engine || new URL(item.url).hostname.replace('www.', ''),
                sourceUrl: item.url,
                imageUrl: item.thumbnail || item.img_src || item.image || null,
                category,
                publishedAt: item.publishedDate ? new Date(item.publishedDate) : new Date(),
                rankScore: 0,
            };
        });
    }

    /**
     * FIX 3: Clean generic titles before saving.
     * Removes noisy strings and falls back to snippet sentence if title is weak.
     */
    private cleanTitle(rawTitle: string, snippet: string): string {
        let cleaned = rawTitle.trim();

        // Remove common generic news noise (case-insensitive)
        const noisePhrases = [
            /latest news/gi,
            /breaking news/gi,
            /today's news/gi,
            /google news/gi,
            /world news/gi,
            /india news/gi,
            /\|.*/gi, // Often removes trailing "| Source Name"
            /-.*/gi    // Often removes trailing "- Source Name"
        ];

        for (const phrase of noisePhrases) {
            cleaned = cleaned.replace(phrase, '').trim();
        }

        // If title becomes too short, try to use first sentence of the snippet
        if (cleaned.length < 15 && snippet) {
            const match = snippet.match(/[^.!?]+[.!?]/);
            if (match && match[0].length > 20) {
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

        // Freshness: +20 if published today
        const now = new Date();
        const diffHours = (now.getTime() - article.publishedAt.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
            score += 20;
        }

        // Penalty for missing image (makes feed look bad)
        if (!article.imageUrl) {
            score -= 10;
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
            // FIX 5: Use cleaned title + snippet for precise topic modeling
            const prompt = `Based on the following news, output one short sentence stating its relevance to competitive exams (like UPSC, SSC).\n\nTitle: ${article.title}\nSnippet: ${article.summary}\n\nRULES:\n- Format exactly like: "Relevant for [Topic]." \n- Example: "Relevant for international relations and diplomacy."\n- Max 1 sentence. Make it precise.`;

            const result = await this.aiService.generateCompletion([
                { role: 'system', content: 'You are an exam curriculum expert mapping current affairs to subjects.' },
                { role: 'user', content: prompt }
            ]);

            return result.content || 'Relevant for current affairs.';
        } catch (error) {
            return 'Relevant for current affairs.';
        }
    }
}
