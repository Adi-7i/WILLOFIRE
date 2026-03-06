import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

/**
 * RedisModule
 *
 * @Global() module providing a single, shared `ioredis` client instance and
 * a convenience `RedisService` wrapper.
 *
 * The `REDIS_CLIENT` provider is exported so that BullMQ can mount onto the
 * exact same connection pool instead of opening new ones.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: (config: ConfigService): Redis => {
                const host = config.get<string>('redis.host') ?? 'localhost';
                const port = config.get<number>('redis.port') ?? 6379;
                const password = config.get<string>('redis.password');
                const useTls = config.get<string>('redis.tls') === 'true';

                return new Redis({
                    host,
                    port,
                    password,
                    tls: useTls ? {} : undefined,
                    // Retry strategy prevents fatal crashes on boot if Redis is down
                    retryStrategy: (times) => Math.min(times * 50, 2000),
                    maxRetriesPerRequest: null, // Required by BullMQ
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
