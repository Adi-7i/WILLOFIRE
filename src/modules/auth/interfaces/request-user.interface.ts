/**
 * RequestUser — the shape of `req.user` after JwtStrategy validates the token.
 * Controllers access this via the @CurrentUser() decorator.
 *
 * Never add sensitive fields (passwordHash etc.) here.
 */
export interface RequestUser {
    userId: string;   // Mapped from JWT payload.sub
    email: string;    // From JWT payload — safe for display/logging
}
