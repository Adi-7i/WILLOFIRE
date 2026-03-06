import { Controller, Get, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../infrastructure/redis/redis.constants';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
    constructor(
        @InjectConnection() private readonly mongooseConnection: Connection,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) { }

    @Get()
    async checkHealth() {
        // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const dbStatus = this.mongooseConnection.readyState === 1 ? 'connected' : 'disconnected';

        // Check Redis natively
        let redisStatus = 'disconnected';
        try {
            const pingResult = await this.redisClient.ping();
            if (pingResult === 'PONG') {
                redisStatus = 'connected';
            }
        } catch (error) {
            // Redis error suppresses cleanly 
        }

        const isOk = dbStatus === 'connected' && redisStatus === 'connected';

        return {
            status: isOk ? 'ok' : 'degraded',
            db: dbStatus,
            redis: redisStatus,
        };
    }
}
