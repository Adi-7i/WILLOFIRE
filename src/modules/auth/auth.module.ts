import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';

/**
 * AuthModule — owns the entire authentication domain.
 *
 * Phase 3 addition:
 *  - UserRepository is now a provider and exported so other modules
 *    (e.g. a future ProfileModule) can query user records without
 *    depending on AuthService.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                // Only secret here — expiresIn passed explicitly per signAsync call
                secret: config.get<string>('jwt.secret') ?? '',
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        UserRepository, // Phase 3: repository layer
    ],
    exports: [
        AuthService,
        JwtModule,      // Other modules can use JwtService (e.g. websockets)
        UserRepository, // Cross-module user lookups
    ],
})
export class AuthModule { }
