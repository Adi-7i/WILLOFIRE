import { IsString, IsNotEmpty } from 'class-validator';

/**
 * RefreshTokenDto
 *
 * The refresh token is sent in the request body (not as a cookie in V1).
 * In a future phase this can be migrated to an httpOnly cookie for
 * improved XSS resistance.
 */
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token is required.' })
    refreshToken!: string;
}
