import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * DatabaseModule
 *
 * Centralizes the MongoDB connection so that no other module has to know
 * about the connection string or retry logic. Feature modules import
 * only their own schema via MongooseModule.forFeature([...]).
 *
 * Uses forRootAsync so that ConfigService is available before the
 * connection is established — avoids the race condition of accessing
 * env vars before the config module is initialized.
 */
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('database.uri'),
                // Connection options that matter in production:
                // - autoIndex: false in prod to avoid silent index creation on startup
                // - serverSelectionTimeoutMS: fail fast instead of hanging indefinitely
                autoIndex: config.get<string>('app.env') !== 'production',
                serverSelectionTimeoutMS: 5000,
            }),
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }
