import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard — the globally applied authentication gate.
 *
 * Registered on APP_GUARD in AppModule, which means EVERY route in the
 * application is protected by default. Routes explicitly opt out by being
 * decorated with @Public().
 *
 * Flow:
 *  1. Check Reflector for @Public() metadata — if present, allow through.
 *  2. Otherwise, delegate to Passport's AuthGuard('jwt') which runs
 *     JwtStrategy.validate() to verify the Bearer token.
 *  3. If token is missing/invalid/expired → 401 Unauthorized (automatic).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        // Check if the route or its controller has the @Public() decorator.
        // Checking both handler AND class allows @Public() on a whole controller.
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            // Short-circuit — no token required for this route.
            return true;
        }

        // Delegate to passport-jwt validation.
        // AuthGuard('jwt') calls JwtStrategy.validate() and attaches the result
        // to request.user. Returns false / throws UnauthorizedException on failure.
        return super.canActivate(context) as boolean | Promise<boolean>;
    }
}
