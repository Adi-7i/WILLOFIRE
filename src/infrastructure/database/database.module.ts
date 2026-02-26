import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { buildMongooseOptions } from './mongoose.config';

/**
 * DatabaseModule
 *
 * Single point of truth for the MongoDB connection.
 * Feature modules never know the connection string — they only import
 * DatabaseModule and then register their own schemas via MongooseModule.forFeature.
 *
 * Connection options are delegated to buildMongooseOptions() for clarity.
 * See mongoose.config.ts for pool sizing and timeout rationale.
 */
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => buildMongooseOptions(config),
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }
