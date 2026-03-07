import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { DiscoverRepository } from './discover.repository';
import { DiscoverService } from './discover.service';
import { DiscoverCategory, SearxngResult } from './discover.types';

describe('DiscoverService', () => {
    let service: DiscoverService;
    let mockConfigService: { get: jest.Mock };
    let mockAiService: { generateCompletion: jest.Mock };
    let mockDiscoverRepository: {
        findArticles: jest.Mock;
        findBySourceUrl: jest.Mock;
        upsertArticle: jest.Mock;
    };

    let originalFetch: typeof global.fetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(() => {
        mockConfigService = {
            get: jest.fn((key: string) => {
                if (key === 'discover.searxngBaseUrl') return 'http://localhost:8080';
                if (key === 'app.isProduction') return false;
                return undefined;
            }),
        };

        mockAiService = {
            generateCompletion: jest.fn().mockResolvedValue({ content: 'APPROVE', tokensUsed: 10 }),
        };

        mockDiscoverRepository = {
            findArticles: jest.fn().mockResolvedValue([]),
            findBySourceUrl: jest.fn().mockResolvedValue(null),
            upsertArticle: jest.fn().mockResolvedValue(undefined),
        };

        global.fetch = jest.fn() as unknown as typeof global.fetch;

        service = new DiscoverService(
            mockConfigService as unknown as ConfigService,
            mockAiService as unknown as AiService,
            mockDiscoverRepository as unknown as DiscoverRepository,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    const buildResult = (overrides: Partial<SearxngResult> = {}): SearxngResult => ({
        title: 'India signs major strategic agreement with neighboring nation',
        url: 'https://reuters.com/world/india/new-deal',
        content: 'Detailed report on the latest strategic agreement affecting bilateral ties.',
        thumbnail: 'https://images.reuters.com/thumbnail.jpg',
        publishedDate: new Date().toISOString(),
        engine: 'bing news',
        parsed_url: ['https', 'reuters.com', 'world', 'india', 'new-deal'],
        template: 'default.html',
        engines: ['bing news'],
        positions: [1],
        score: 1,
        category: 'news',
        ...overrides,
    });

    it('builds source-targeted queries as site:domain keyword combinations', () => {
        const queries = (service as any).buildTargetedQueries(DiscoverCategory.SCIENCE_TECH) as string[];

        expect(queries).toContain('site:nature.com AI breakthrough');
        expect(queries).toContain('site:science.org space mission');
        expect(queries).toContain('site:isro.gov.in scientific discovery');
    });

    it('requests SearXNG using engines=bing news', async () => {
        const fetchMock = global.fetch as unknown as jest.Mock;
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: [buildResult()] }),
        });

        const results = await (service as any).fetchFromSearxng('site:reuters.com policy update');

        expect(results).toHaveLength(2);
        expect(fetchMock).toHaveBeenCalledTimes(2);

        const firstUrl = new URL(fetchMock.mock.calls[0][0] as string);
        expect(firstUrl.searchParams.get('engines')).toBe('bing news');
        expect(firstUrl.searchParams.get('q')).toBe('site:reuters.com policy update');
    });

    it('returns empty results when SearXNG fetch throws, instead of failing the category', async () => {
        const fetchMock = global.fetch as unknown as jest.Mock;
        fetchMock.mockRejectedValue(new Error('fetch failed'));

        await expect((service as any).fetchFromSearxng('site:reuters.com policy update')).resolves.toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('continues targeted batches even if one query promise rejects', async () => {
        const fetchFromSearxngSpy = jest.spyOn(service as any, 'fetchFromSearxng')
            .mockImplementation((...args: unknown[]) => {
                const query = String(args[0] ?? '');
                if (query.includes('bad-query')) {
                    return Promise.reject(new Error('transient failure'));
                }
                return Promise.resolve([buildResult({ url: `https://reuters.com/world/${query}` })]);
            });

        const result = await (service as any).fetchTargetedResults([
            'site:reuters.com good-query',
            'site:reuters.com bad-query',
            'site:reuters.com another-good-query',
        ]);

        expect(result).toHaveLength(2);
        expect(fetchFromSearxngSpy).toHaveBeenCalledTimes(3);
    });

    it('rejects stale, missing, and invalid publish dates', () => {
        const oldDate = new Date(Date.now() - (73 * 60 * 60 * 1000)).toISOString();

        expect((service as any).isArticleFresh(undefined)).toBe(false);
        expect((service as any).isArticleFresh('not-a-date')).toBe(false);
        expect((service as any).isArticleFresh(oldDate)).toBe(false);
        expect((service as any).isArticleFresh(new Date().toISOString())).toBe(true);
    });

    it('rejects non-news article types like partner content and archives', () => {
        const partnerContent = buildResult({
            title: 'Partner Content: Industry analysis',
            url: 'https://nature.com/archive/feature-article',
        });

        const isRejected = (service as any).isNonNewsArticleType(partnerContent);
        expect(isRejected).toBe(true);
    });

    it('cleans noisy titles and removes source suffixes', () => {
        const cleaned = (service as any).cleanTitle(
            "Breaking News: India signs climate pact | Reuters",
            'India signs climate pact with neighboring countries for emissions control.',
        ) as string;

        expect(cleaned.toLowerCase()).not.toContain('breaking news');
        expect(cleaned.toLowerCase()).not.toContain('reuters');
    });

    it('deduplicates raw results using normalized URLs', () => {
        const itemA = buildResult({ url: 'https://www.reuters.com/world/india/new-deal?utm_source=google' });
        const itemB = buildResult({ url: 'https://reuters.com/world/india/new-deal' });

        const deduped = (service as any).deduplicateRawResults([itemA, itemB]) as SearxngResult[];
        expect(deduped).toHaveLength(1);
    });

    it('enforces no-image exception policy with extremely strong headlines only', () => {
        const weakNoImageArticle = {
            title: 'India update today',
            summary: 'Short update',
            source: 'reuters.com',
            sourceUrl: 'https://reuters.com/a',
            imageUrl: null,
            category: DiscoverCategory.TODAYS_HEADLINES,
            publishedAt: new Date(),
            rankScore: 0,
        };

        const strongNoImageArticle = {
            ...weakNoImageArticle,
            title: 'India approves new maritime cooperation framework with strategic regional partners',
            sourceUrl: 'https://reuters.com/b',
        };

        expect((service as any).passesNoImageExceptionPolicy(weakNoImageArticle)).toBe(false);
        expect((service as any).passesNoImageExceptionPolicy(strongNoImageArticle)).toBe(true);
    });

    it('normalizes results with freshness and trust checks before mapping', async () => {
        const validateSpy = jest.spyOn(service as any, 'validateImageUrl').mockResolvedValue('https://images.reuters.com/ok.jpg');

        const freshTrusted = buildResult({
            url: 'https://reuters.com/world/india/fresh-item',
            title: 'India announces major fiscal policy framework for long-term growth',
        });

        const stale = buildResult({
            url: 'https://reuters.com/world/india/stale-item',
            publishedDate: new Date(Date.now() - (80 * 60 * 60 * 1000)).toISOString(),
        });

        const untrusted = buildResult({
            url: 'https://randomblog.example.com/post',
        });

        const normalized = await (service as any).normalizeResults(
            [freshTrusted, stale, untrusted],
            DiscoverCategory.ECONOMY,
        );

        expect(normalized).toHaveLength(1);
        expect(normalized[0].source).toBe('reuters.com');
        expect(validateSpy).toHaveBeenCalled();
    });
});
