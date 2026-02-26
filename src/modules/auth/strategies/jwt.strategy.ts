import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../interfaces/jwt.payload';
import type { RequestUser } from '../interfaces/request-user.interface';

/**
 * JwtStrategy — Passport strategy that validates incoming Bearer tokens.
 *
 * How it fits into the flow:
 *  1. JwtAuthGuard triggers this strategy on every non-@Public() route.
 *  2. ExtractJwt reads the token from the Authorization: Bearer header.
 *  3. Passport verifies the signature + expiry using the JWT_SECRET.
 *  4. validate() receives the decoded payload and returns what becomes req.user.
 *
 * The secret comes from ConfigService — never hardcoded.
 * Token expiry is enforced by Passport (rejects expired tokens automatically).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        super({
            // Read Bearer token from Authorization header
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Do NOT ignore expiration — a strategy that accepts expired tokens
            // is a critical security vulnerability.
            ignoreExpiration: false,

            // Secret from env — never a hardcoded string.
            secretOrKey: config.get<string>('jwt.secret') ?? '',
        });
    }

    /**
     * Called by Passport AFTER the token signature and expiry are verified.
     * Whatever is returned here is set as req.user for the request lifecycle.
     *
     * We deliberately return only userId and email — never the full DB document.
     */
    validate(payload: JwtPayload): RequestUser {
        return {
            userId: payload.sub,
            email: payload.email,
        };
    }
}
