import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../../modules/auth/interfaces/request-user.interface';

/**
 * @CurrentUser() — extracts the authenticated user from the request object.
 *
 * JwtStrategy.validate() populates `req.user` after a successful token
 * validation. This decorator is a clean alternative to injecting the request
 * and manually accessing `req.user` inside a controller.
 *
 * This decorator is ONLY valid on guarded routes. If used on a @Public()
 * route, req.user will be undefined. Type it as `RequestUser | undefined`
 * in that case.
 *
 * Usage:
 *   @Post('logout')
 *   async logout(@CurrentUser() user: RequestUser) {
 *     return this.authService.logout(user.userId);
 *   }
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): RequestUser => {
        const request = ctx.switchToHttp().getRequest<Request & { user: RequestUser }>();
        return request.user;
    },
);
