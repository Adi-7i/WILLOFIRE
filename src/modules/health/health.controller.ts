import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../infrastructure/redis/redis.constants';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
    constructor(
        private readonly config: ConfigService,
        @InjectConnection() private readonly mongooseConnection: Connection,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) { }

    @Get()
    async checkHealth() {
        // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const dbStatus = this.mongooseConnection.readyState === 1 ? 'connected' : 'disconnected';
        const redisEnabled = this.config.get<boolean>('redis.enabled') ?? true;

        // Check Redis natively
        let redisStatus = redisEnabled ? 'disconnected' : 'disabled';
        if (redisEnabled) {
            try {
                const pingResult = await this.redisClient.ping();
                if (pingResult === 'PONG') {
                    redisStatus = 'connected';
                }
            } catch (error) {
                // Redis error suppresses cleanly
            }
        }

        const isOk = redisEnabled
            ? dbStatus === 'connected' && redisStatus === 'connected'
            : dbStatus === 'connected';

        return {
            status: isOk ? 'ok' : 'degraded',
            db: dbStatus,
            redis: redisStatus,
        };
    }
}
