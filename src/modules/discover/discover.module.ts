import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from '../ai/ai.module';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';
import { DiscoverScheduler } from './discover.scheduler';
import { DiscoverRepository } from './discover.repository';
import { DiscoverArticle, DiscoverArticleSchema } from './discover.schema';

@Module({
    imports: [
        // Load the module's Mongoose schema into the connection
        MongooseModule.forFeature([
            { name: DiscoverArticle.name, schema: DiscoverArticleSchema },
        ]),
        // Bring in the AiModule so we can inject AiService
        AiModule,
        ConfigModule,
    ],
    controllers: [DiscoverController],
    providers: [
        DiscoverService,
        DiscoverRepository,
        DiscoverScheduler,
    ],
    // Do not export unless another module needs to consume discover services directly
})
export class DiscoverModule { }
