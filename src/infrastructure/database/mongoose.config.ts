import type { MongooseModuleOptions } from '@nestjs/mongoose';
import type { ConfigService } from '@nestjs/config';

/**
 * buildMongooseOptions
 *
 * Returns the full MongooseModuleOptions object, derived from ConfigService.
 * Centralizing this keeps database.module.ts lean and makes tuning easy.
 *
 * Connection pool decisions:
 *  - maxPoolSize: 10 — handles burst traffic without overwhelming MongoDB
 *  - minPoolSize: 2  — keeps 2 warm connections so cold-start latency stays low
 *  - socketTimeoutMS: 45 000 — Heroku/Atlas idle connections are killed at 30s;
 *      45s gives a comfortable buffer to detect stale sockets
 *  - connectTimeoutMS: 10 000 — fail fast on bad URI instead of hanging forever
 *  - serverSelectionTimeoutMS: 5 000 — surface bad Atlas cluster early during startup
 *
 * autoIndex:
 *  - true in dev/test: Mongoose creates indexes on startup automatically
 *  - false in production: indexes must be created via migration before deploy
 *    to avoid blocking collection scans on large datasets
 */
export function buildMongooseOptions(
    config: ConfigService,
): MongooseModuleOptions {
    const isProduction = config.get<string>('app.env') === 'production';

    return {
        uri: config.get<string>('database.uri') ?? '',

        // ── Index management ────────────────────────────────────────────────────
        autoIndex: !isProduction,

        // ── Connection pool ──────────────────────────────────────────────────────
        maxPoolSize: config.get<number>('database.maxPoolSize') ?? 10,
        minPoolSize: config.get<number>('database.minPoolSize') ?? 2,

        // ── Timeouts ─────────────────────────────────────────────────────────────
        socketTimeoutMS: 45_000,
        connectTimeoutMS: 10_000,
        serverSelectionTimeoutMS: 5_000,
    };
}
