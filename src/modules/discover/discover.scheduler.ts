import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { DiscoverService } from './discover.service';

@Injectable()
export class DiscoverScheduler implements OnModuleInit {
    private readonly logger = new Logger(DiscoverScheduler.name);
    private readonly isProduction: boolean;

    constructor(
        private readonly discoverService: DiscoverService,
        private readonly configService: ConfigService,
    ) {
        this.isProduction = this.configService.get<boolean>('app.isProduction') ?? process.env.NODE_ENV === 'production';
    }

    /**
     * Run an initial fetch when the module starts up, rather than
     * forcing the user to wait a full hour for the first feed.
     */
    async onModuleInit() {
        this.logVerbose('Executing initial Discover feed fetch on bootstrap...');
        // Execute asynchronously so it doesn't block app startup
        this.runFetchSafely();
    }

    /**
     * Runs exactly once every hour at minute 0.
     * Cron is more predictable and operationally safer than @Interval.
     */
    @Cron('0 * * * *')
    async handleCron() {
        this.logVerbose('Executing scheduled Discover feed fetch...');
        await this.runFetchSafely();
    }

    private async runFetchSafely() {
        try {
            await this.discoverService.fetchAndStore();
        } catch (error) {
            // Unhandled errors here must be caught so the scheduler thread doesn't crash
            this.logger.error(`Critical error in Discover scheduler: ${(error as Error).message}`, (error as Error).stack);
        }
    }

    private logVerbose(message: string): void {
        if (!this.isProduction) {
            this.logger.log(message);
        }
    }
}
