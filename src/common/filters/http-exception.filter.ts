import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter
 *
 * Global exception filter that intercepts ALL unhandled exceptions and
 * normalizes them into a consistent JSON error shape. This ensures every
 * error response across every endpoint looks identical — critical for
 * frontend/client predictability and for centralized error monitoring.
 *
 * Shape returned to clients:
 * {
 *   success: false,
 *   statusCode: number,
 *   message: string | string[],
 *   error: string,
 *   path: string,
 *   timestamp: string
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Determine status: use the exception's status if it's an HttpException,
        // otherwise fall back to 500 (unexpected/unhandled error).
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Extract the message payload (NestJS can return string or object).
        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const message =
            typeof exceptionResponse === 'object' &&
                'message' in (exceptionResponse as object)
                ? (exceptionResponse as Record<string, unknown>).message
                : exceptionResponse;

        const errorName =
            typeof exceptionResponse === 'object' &&
                'error' in (exceptionResponse as object)
                ? (exceptionResponse as Record<string, unknown>).error
                : HttpStatus[status];

        // Log unexpected 5xx errors with full stack for debugging.
        if (status >= 500) {
            this.logger.error(
                `[${request.method}] ${request.url} → ${status}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } else {
            // 4xx are expected client errors — log at warn level only.
            this.logger.warn(`[${request.method}] ${request.url} → ${status}`);
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            error: errorName,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
