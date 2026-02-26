import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';

/**
 * AuthModule — owns the entire authentication domain.
 *
 * JwtModule is registered with registerAsync so ConfigService is
 * available before the module initializes — avoids the env-var race condition.
 *
 * PassportModule sets 'jwt' as the default strategy so JwtAuthGuard
 * doesn't need to name it explicitly in every usage.
 */
@Module({
    imports: [
        // Register the User schema scoped to this module only.
        // Other modules never access the User model directly — they go through AuthService.
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

        // Passport with JWT as the default strategy
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // JwtModule configured asynchronously via ConfigService.
        // We set the default signing options here (access token).
        // Refresh token uses different secrets — signed explicitly in AuthService.
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                // Only set the secret here. expiresIn is passed explicitly in each
                // signAsync() call in AuthService to support dual-token signing.
                secret: config.get<string>('jwt.secret') ?? '',
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy, // Must be a provider so Passport discovers it
    ],
    exports: [
        AuthService,
        JwtModule,  // Exported so other modules can use JwtService (e.g. sockets in Phase 4)
    ],
})
export class AuthModule { }
