/**
 * common/constants/index.ts
 *
 * All application-wide constants are defined here.
 * No magic strings scattered across the codebase.
 *
 * Phase 2+ will add:
 *  - CACHE_TTL_SECONDS — Redis cache expiry durations
 *  - MAX_FILE_SIZE_BYTES — upload size limits
 *  - QUEUE_NAMES — BullMQ queue name constants
 *  - JWT_STRATEGY — strategy name for Passport
 */

export const APP_NAME = 'Willofire';
export const API_VERSION = 'v1';

// TODO (Phase 2): Add QUEUE_NAMES, CACHE_KEYS, MAX_FILE_SIZE constants
