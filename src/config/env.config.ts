import { registerAs } from '@nestjs/config';

/**
 * env.config.ts
 *
 * Centralizes all environment variable access behind a typed config
 * namespace. This prevents scattered `process.env` lookups across the
 * codebase and makes config testable via ConfigService.
 *
 * Usage (in any service):
 *   constructor(private config: ConfigService) {}
 *   this.config.get('app.port')
 */

// ── App config ──────────────────────────────────────────────────────────────
export const appConfig = registerAs('app', () => ({
    name: process.env.APP_NAME ?? 'Willofire',
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiVersion: process.env.API_VERSION ?? 'v1',
    isProduction: process.env.NODE_ENV === 'production',
}));

// ── Database config (placeholder for Phase 2) ───────────────────────────────
export const dbConfig = registerAs('database', () => ({
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/willofire',
}));

// ── Redis config (placeholder for Phase 2) ──────────────────────────────────
export const redisConfig = registerAs('redis', () => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
}));

// ── JWT config ──────────────────────────────────────────────────────────────
// Access token and refresh token use DIFFERENT secrets so a leaked access
// token secret cannot be used to forge refresh tokens (and vice versa).
export const jwtConfig = registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

// ── AI config (placeholder for Phase 3) ─────────────────────────────────────
export const aiConfig = registerAs('ai', () => ({
    openaiApiKey: process.env.OPENAI_API_KEY,
}));

// ── Storage config (placeholder for Phase 2) ────────────────────────────────
export const storageConfig = registerAs('storage', () => ({
    provider: process.env.STORAGE_PROVIDER ?? 'local',
}));
