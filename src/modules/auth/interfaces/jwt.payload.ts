/**
 * JwtPayload — the data encoded inside every access and refresh token.
 *
 * `sub` (subject) = MongoDB user _id.toString()
 * This is the CANONICAL source of userId everywhere in the system.
 * No endpoint should accept userId from a request body.
 */
export interface JwtPayload {
    sub: string;    // MongoDB ObjectId as string — the user's identity
    email: string;  // Included for convenience (e.g. logging), NOT for auth decisions
    iat?: number;   // Issued-at — set automatically by JwtService
    exp?: number;   // Expiry — set automatically by JwtService
}
