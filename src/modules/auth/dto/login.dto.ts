import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * LoginDto
 *
 * Intentionally less strict on password format than RegisterDto —
 * we only need to verify it's a non-empty string and let bcrypt do
 * the matching. Over-validating here could reveal password policy info.
 */
export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    password!: string;
}
