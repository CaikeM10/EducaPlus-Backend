import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { correlationId?: string }>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    request.correlationId =
      (request.headers['x-correlation-id'] as string | undefined) ??
      randomUUID();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            correlationId: request.correlationId,
            method: request.method,
            path: request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
    );
  }
}
