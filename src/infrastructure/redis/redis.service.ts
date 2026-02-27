import { Injectable, Inject, Logger, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

/**
 * RedisService
 *
 * A high-level wrapper over the raw ioredis connection exposing common primitives:
 * - getting values
 * - setting values (with optional TTL)
 * - deleting values
 *
 * For advanced usages (e.g., pipelining, queue backends), inject REDIS_CLIENT directly.
 */
@Injectable()
export class RedisService implements OnApplicationShutdown {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    /** Graceful shutdown closes the connection cleanly. */
    onApplicationShutdown() {
        this.logger.log('Disconnecting from Redis');
        this.redis.disconnect();
    }

    /**
     * Get a string value from Redis by key.
     */
    async get(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (error) {
            this.logger.error(`Failed to GET key [${key}]`, error);
            throw error;
        }
    }

    /**
     * Set a string value in Redis.
     *
     * @param key The cache key
     * @param value The value to store
     * @param ttlSeconds Optional Time-to-Live in seconds. If omitted, key persists indefinitely.
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            if (ttlSeconds) {
                // EX = seconds
                await this.redis.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.redis.set(key, value);
            }
        } catch (error) {
            this.logger.error(`Failed to SET key [${key}]`, error);
            throw error;
        }
    }

    /**
     * Delete a key from Redis entirely.
     */
    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            this.logger.error(`Failed to DEL key [${key}]`, error);
            throw error;
        }
    }
}
