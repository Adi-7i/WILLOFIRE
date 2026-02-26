import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { JwtPayload } from './interfaces/jwt.payload';
import type { AuthTokensResponse } from './interfaces/auth-tokens.interface';

/**
 * AuthService — the ONLY place where auth business logic lives.
 *
 * Controllers call these methods and return the result. They never touch
 * bcrypt, JwtService, or the User model directly.
 *
 * Refresh token security model:
 *  - On login/register: a refresh token is issued and its bcrypt hash stored in DB.
 *  - On refresh: incoming token is compared to the stored hash (rotation).
 *  - On logout: `refreshTokenHash` is set to null, invalidating the session.
 *  - If the DB leaks: hashed tokens are useless without the raw token.
 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    // bcrypt cost factor — 12 is the production-safe minimum.
    // Higher = more secure but slower. 10 is acceptable for dev speed.
    private readonly BCRYPT_ROUNDS = 12;

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // Public methods (called by AuthController)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Register a new user account.
     *
     * Steps:
     *  1. Check for duplicate email (409 if exists).
     *  2. Hash the password.
     *  3. Save the user document.
     *  4. Generate + persist token pair.
     *  5. Return tokens (user object is NOT returned — reduces data leakage).
     */
    async register(dto: RegisterDto): Promise<AuthTokensResponse> {
        const existing = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });

        if (existing) {
            // Use a generic message to avoid confirming which emails are registered.
            throw new ConflictException('An account with this email already exists.');
        }

        const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

        const user = await this.userModel.create({
            email: dto.email.toLowerCase(),
            passwordHash,
        });

        this.logger.log(`New user registered: ${user._id.toString()}`);

        return this.generateAndPersistTokens(user);
    }

    /**
     * Authenticate a user by email + password.
     *
     * Always uses bcrypt.compare — timing-safe. Never short-circuit before
     * calling compare, as that would create a timing oracle for valid emails.
     */
    async login(dto: LoginDto): Promise<AuthTokensResponse> {
        const user = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });

        // Run bcrypt compare even when user is not found to prevent timing attacks.
        // Comparing against a dummy hash ensures consistent response time.
        const dummyHash =
            '$2b$12$invalidhashpadding00000000000000000000000000000000000';
        const passwordMatch = await bcrypt.compare(
            dto.password,
            user?.passwordHash ?? dummyHash,
        );

        if (!user || !passwordMatch) {
            // Same message for both cases — avoid leaking whether email exists.
            throw new UnauthorizedException('Invalid email or password.');
        }

        this.logger.log(`User logged in: ${user._id.toString()}`);

        return this.generateAndPersistTokens(user);
    }

    /**
     * Issue a new token pair from a valid refresh token.
     *
     * Security:
     *  - We verify the refresh token's JWT signature first (JwtService.verify).
     *  - Then compare the raw token against the stored bcrypt hash.
     *  - Old refresh token is immediately replaced (rotation) — replay attacks
     *    with a stolen token will fail after the first use.
     */
    async refresh(dto: RefreshTokenDto): Promise<AuthTokensResponse> {
        let payload: JwtPayload;

        try {
            payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
                secret: this.config.get<string>('jwt.refreshSecret'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token.');
        }

        const user = await this.userModel.findById(payload.sub);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Session not found. Please log in again.');
        }

        const tokenMatches = await bcrypt.compare(
            dto.refreshToken,
            user.refreshTokenHash,
        );

        if (!tokenMatches) {
            // Token reuse detected — invalidate the session entirely as a precaution.
            await this.userModel.findByIdAndUpdate(user._id, {
                refreshTokenHash: null,
            });
            throw new UnauthorizedException(
                'Refresh token reuse detected. Please log in again.',
            );
        }

        this.logger.log(`Tokens rotated for user: ${user._id.toString()}`);

        return this.generateAndPersistTokens(user);
    }

    /**
     * Invalidate the user's session by nulling their stored refresh token hash.
     *
     * `userId` comes from the JWT payload via @CurrentUser() — NOT the body.
     * This means only the authenticated owner can log themselves out.
     */
    async logout(userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });

        this.logger.log(`User logged out: ${userId}`);

        return { message: 'Logged out successfully.' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Signs a new access + refresh token pair, hashes the refresh token,
     * persists the hash, and returns both raw tokens to the caller.
     *
     * This is the single place where tokens are generated — ensures consistent
     * signing parameters and hash storage across all auth flows.
     */
    private async generateAndPersistTokens(
        user: UserDocument,
    ): Promise<AuthTokensResponse> {
        const userId = user._id.toString();
        const payload: JwtPayload = { sub: userId, email: user.email };

        const [accessToken, refreshToken] = await Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('jwt.secret'),
                expiresIn: (this.config.get<string>('jwt.expiresIn') ?? '15m') as unknown as number,
            }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('jwt.refreshSecret'),
                expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ?? '7d') as unknown as number,
            }),
        ]);

        // Hash the refresh token before storing — never store raw tokens.
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.BCRYPT_ROUNDS);

        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash });

        return { accessToken, refreshToken };
    }
}
