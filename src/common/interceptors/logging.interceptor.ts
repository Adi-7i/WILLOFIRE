import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * LoggingInterceptor
 *
 * Attaches structured request/response logging to every route automatically.
 * Logs method, URL, and response time in ms. This gives us observability at
 * the HTTP boundary without polluting controllers or services.
 *
 * In Phase 2, this can be augmented with request IDs (correlation IDs) and
 * sent to a centralized logging service (e.g. Datadog, CloudWatch).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;
        const startTime = Date.now();

        this.logger.log(`→ ${method} ${url}`);

        return next.handle().pipe(
            tap(() => {
                const elapsed = Date.now() - startTime;
                this.logger.log(`← ${method} ${url} [${elapsed}ms]`);
            }),
        );
    }
}
