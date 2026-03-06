import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queues/queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { McqModule } from './modules/mcq/mcq.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { AiModule } from './modules/ai/ai.module';

// Global guard
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Environment config namespaces
import {
  appConfig,
  dbConfig,
  redisConfig,
  jwtConfig,
  aiConfig,
  storageConfig,
} from './config/env.config';

/**
 * AppModule — root module.
 *
 * Phase 2 changes:
 *  1. DatabaseModule added — establishes the single MongoDB connection.
 *  2. JwtAuthGuard registered as APP_GUARD — protects ALL routes globally.
 *     Routes opt out with @Public(). Secure by default.
 */
@Module({
  imports: [
    // ── Environment configuration ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
      load: [appConfig, dbConfig, redisConfig, jwtConfig, aiConfig, storageConfig],
    }),

    // ── Infrastructure ─────────────────────────────────────────────────────
    DatabaseModule,
    RedisModule,
    StorageModule,
    QueueModule,

    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    PdfModule,
    McqModule,
    EvaluationModule,
    AiModule,
  ],
  providers: [
    // ── Global JWT guard ───────────────────────────────────────────────────
    // APP_GUARD is a NestJS token that registers a provider as a guard for the
    // entire application. Has the same effect as useGlobalGuards() in main.ts,
    // but allows dependency injection (Reflector) to work correctly.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
