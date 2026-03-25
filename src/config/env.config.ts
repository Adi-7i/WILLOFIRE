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

// ── Redis config ─────────────────────────────────────────────────────────────
export const redisConfig = registerAs('redis', () => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    username: process.env.REDIS_USERNAME ?? 'default',
    password: process.env.REDIS_PASSWORD ?? undefined,
    tls: process.env.REDIS_TLS ?? 'false',
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

// ── AI config ────────────────────────────────────────────────────────────────
// Split into two sub-namespaces that mirror the two Azure OpenAI endpoints
// defined in .env: one for chat/completions (LLM_*) and one for embeddings
// (OPENAI_*). Using ConfigService.get('ai.llm.apiKey') etc. in AiService.
export const aiConfig = registerAs('ai', () => ({
    // ── LLM (Azure OpenAI — chat completions) ─────────────────────────────
    llm: {
        provider: process.env.LLM_PROVIDER ?? 'azure',
        apiKey: process.env.LLM_API_KEY,
        baseURL: process.env.LLM_AZURE_BASE_URL,
        apiVersion: process.env.LLM_AZURE_API_VERSION ?? '2024-12-01-preview',
        deployment: process.env.LLM_AZURE_DEPLOYMENT ?? 'gpt-4.1',
    },
    // ── Embedding (separate Azure OpenAI endpoint) ─────────────────────────
    embed: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small',
        maxChunks: parseInt(process.env.AI_MAX_CHUNKS ?? '5', 10),
    },
}));

// ── Storage config ──────────────────────────────────────────────────────────
export const storageConfig = registerAs('storage', () => ({
    provider: process.env.STORAGE_PROVIDER ?? 'azure',
    azure: {
        connectionString: process.env.AZURE_BLOB_CONNECTION_STRING ?? '',
        container: process.env.AZURE_BLOB_CONTAINER_NAME ?? '',
        sasExpiryHours: parseInt(process.env.BLOB_SAS_EXPIRY_HOURS ?? '24', 10),
    },
}));
