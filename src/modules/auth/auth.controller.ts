import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthTokensResponse } from './interfaces/auth-tokens.interface';
import type { RequestUser } from './interfaces/request-user.interface';

/**
 * AuthController — THIN controller.
 *
 * This controller's only job:
 *  1. Receive the validated DTO (global ValidationPipe handles validation)
 *  2. Call the appropriate AuthService method
 *  3. Return the result
 *
 * No password hashing, no token logic, no DB queries — all of that lives in AuthService.
 *
 * Route security model:
 *  - register, login, refresh → @Public() → no JWT required
 *  - logout → NO @Public() → requires valid JWT → userId comes from @CurrentUser() NOT body
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /api/auth/register
     * Create a new user account and return JWT token pair.
     * Public — no token needed.
     */
    @Public()
    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<AuthTokensResponse> {
        return this.authService.register(dto);
    }

    /**
     * POST /api/auth/login
     * Authenticate credentials and return JWT token pair.
     * Returns 200 (not 201) — nothing is being created, just authenticated.
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto): Promise<AuthTokensResponse> {
        return this.authService.login(dto);
    }

    /**
     * POST /api/auth/refresh
     * Exchange a valid refresh token for a new token pair (rotation).
     * Public — the refresh token itself IS the credential here.
     */
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponse> {
        return this.authService.refresh(dto);
    }

    /**
     * POST /api/auth/logout
     * Invalidate the current user's session.
     *
     * PROTECTED — requires a valid access token.
     * userId is extracted from the JWT via @CurrentUser(), never from the body.
     * This prevents one user from logging out another.
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser() user: RequestUser,
    ): Promise<{ message: string }> {
        return this.authService.logout(user.userId);
    }
}
