import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
    DiscoverArticle,
    DiscoverArticleDocument,
} from './discover.schema';
import { DiscoverCategory, FRESHNESS_THRESHOLD_HOURS, NormalizedArticle } from './discover.types';

@Injectable()
export class DiscoverRepository {
    private readonly logger = new Logger(DiscoverRepository.name);

    constructor(
        @InjectModel(DiscoverArticle.name)
        private readonly articleModel: Model<DiscoverArticleDocument>,
    ) { }

    /**
     * Upsert an article using its unique sourceUrl.
     * This ensures the DB itself acts as a fail-safe deduplication layer.
     */
    async upsertArticle(
        data: NormalizedArticle & { examRelevance: string; summary: string },
    ): Promise<void> {
        try {
            await this.articleModel.updateOne(
                { sourceUrl: data.sourceUrl },
                { $setOnInsert: data },
                { upsert: true }, // Only insert if missing. Do not overwrite existing scores/summaries.
            );
        } catch (error) {
            this.logger.error(`Failed to upsert article ${data.sourceUrl}`, (error as Error).stack);
        }
    }

    /**
     * Retrieve articles for the feed.
     * Sorted by rankScore (descending) then publishedAt (descending).
     */
    async findArticles(
        category?: DiscoverCategory,
        limit = 30,
        skip = 0,
    ): Promise<DiscoverArticleDocument[]> {
        const freshnessCutoff = new Date(Date.now() - (FRESHNESS_THRESHOLD_HOURS * 60 * 60 * 1000));
        const filter: Record<string, unknown> = {
            publishedAt: { $gte: freshnessCutoff },
        };

        if (category) {
            filter.category = category;
        }

        return this.articleModel
            .find(filter)
            .sort({ rankScore: -1, publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async findBySourceUrl(sourceUrl: string): Promise<DiscoverArticleDocument | null> {
        return this.articleModel.findOne({ sourceUrl }).exec();
    }
}
