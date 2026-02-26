import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * main.ts — Application bootstrap
 *
 * This file is the sole entry point. It is intentionally minimal.
 * All global middleware (pipes, filters, interceptors) is registered here so
 * it applies uniformly to every route. No business logic lives here.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Buffer logs until Logger is fully initialized.
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;
  const env = config.get<string>('app.env') ?? 'development';

  // ── URI versioning ──────────────────────────────────────────────────────
  // Enables /v1/... routes globally. When V2 routes are needed, they can
  // coexist without breaking existing consumers.
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ── Global prefix ────────────────────────────────────────────────────────
  // All routes are scoped under /api. Combined with versioning → /api/v1/...
  app.setGlobalPrefix('api');

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Permissive in dev; restrict origins in production via env variables.
  app.enableCors({
    origin: env === 'production' ? config.get('app.allowedOrigins') : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── Global validation pipe ───────────────────────────────────────────────
  // Automatically validates every incoming request DTO using class-validator.
  // - whitelist: strips unknown properties (prevents mass-assignment attacks)
  // - forbidNonWhitelisted: throws 400 if unknown properties are sent
  // - transform: auto-coerces payload primitives to DTO types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global exception filter ──────────────────────────────────────────────
  // Catches ALL unhandled exceptions and normalizes them into a consistent
  // JSON error shape. Must be registered after the app is created.
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global logging interceptor ───────────────────────────────────────────
  // Logs every incoming request and its response time automatically.
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);

  logger.log(`🚀 Willofire API running on port ${port} in [${env}] mode`);
  logger.log(`📍 Base URL: http://localhost:${port}/api/v1`);
}

// Handle unhandled promise rejections at the process level.
// This is a safety net — proper error handling should happen in services.
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('Process');
  logger.error('Unhandled Promise Rejection', { reason, promise });
});

bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
