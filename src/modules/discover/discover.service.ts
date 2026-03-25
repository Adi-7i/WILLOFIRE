import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiService } from '../ai/ai.service';
import { DiscoverRepository } from './discover.repository';
import { DiscoverCategory } from './discover.types';

@Injectable()
export class DiscoverService {
    private readonly logger = new Logger(DiscoverService.name);
    private readonly isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly aiService: AiService,
        private readonly discoverRepository: DiscoverRepository,
    ) {
        this.isProduction = this.configService.get<boolean>('app.isProduction') ?? process.env.NODE_ENV === 'production';
    }

    /**
     * Public method used by the Controller to fetch news for clients.
     */
    async getArticles(category?: DiscoverCategory, limit = 30) {
        const articles = await this.discoverRepository.findArticles(category, limit);
        return articles;
    }

    /**
     * Main orchestration method called by the Scheduler (Cron).
     * Currently a stub pending the Perplexity-style feed rebuild.
     */
    async fetchAndStore(): Promise<void> {
        this.logVerbose('Automated Discover feed refresh called (STUBBED for rebuild).');
        // Rebuild logic will go here
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
