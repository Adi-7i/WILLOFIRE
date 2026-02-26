import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

/**
 * RegisterDto
 *
 * Validated at the HTTP boundary by the global ValidationPipe.
 * Controller never sees raw input — only a fully-validated typed object.
 * Password strength is enforced here, NOT in the service, to catch
 * invalid input before any business logic runs.
 */
export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @MaxLength(64, { message: 'Password must not exceed 64 characters.' })
    @Matches(/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
        message:
            'Password must contain at least one uppercase letter, one number, and one special character.',
    })
    password!: string;
}
