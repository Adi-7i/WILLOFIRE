/**
 * AuthTokensResponse — returned after successful register, login, or refresh.
 * Both tokens are JWTs — access token is short-lived, refresh is long-lived.
 */
export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
}
