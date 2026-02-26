import { SetMetadata } from '@nestjs/common';

/**
 * IS_PUBLIC_KEY — metadata key used by JwtAuthGuard to identify public routes.
 * Exported so JwtAuthGuard can use the same constant for Reflector lookup.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — opt-out decorator for the globally applied JwtAuthGuard.
 *
 * By default, EVERY route in this application requires a valid JWT.
 * Annotate a route handler (or an entire controller) with @Public()
 * to allow unauthenticated access.
 *
 * Usage:
 *   @Public()
 *   @Post('login')
 *   async login(@Body() dto: LoginDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
