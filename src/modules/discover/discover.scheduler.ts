import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
     * Stubbed out during rebuild.
     */
    async onModuleInit() {
        this.logVerbose('DiscoverScheduler module initialized. Auto-fetch disabled.');
    }

    /**
     * Scheduled runs disabled pending rebuild.
     */
    // @Cron('0 * * * *')
    async handleCron() {
        this.logVerbose('Discover cron triggered, but ignored (disabled during rebuild).');
    }

    private logVerbose(message: string): void {
        if (!this.isProduction) {
            this.logger.log(message);
        }
    }
}
