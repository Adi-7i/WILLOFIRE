import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
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
    // DatabaseModule establishes the Mongoose connection once for the whole app.
    // Feature modules import only their own schemas via MongooseModule.forFeature().
    DatabaseModule,

    // StorageModule provides STORAGE_TOKEN globally. Feature modules use it
    // for file persistence without knowing the underlying provider (Azure).
    StorageModule,

    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    PdfModule,
    McqModule,
    EvaluationModule,
    AiModule,

    // TODO (Phase 2): RedisModule
    // TODO (Phase 2): BullMQ queue modules
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
