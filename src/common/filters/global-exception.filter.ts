import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();
    const correlationId = request.correlationId ?? randomUUID();

    const error = this.normalizeException(exception);

    this.logger.error(
      JSON.stringify({
        correlationId,
        method: request.method,
        path: request.url,
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      }),
    );

    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
        correlationId,
      },
    });
  }

  private normalizeException(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'UNIQUE_CONSTRAINT',
          message: 'Registro duplicado',
          details: exception.meta,
        };
      }

      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Registro não encontrado',
        };
      }

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: `PRISMA_${exception.code}`,
        message: 'Erro ao processar dados',
      };
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      return {
        statusCode: exception.getStatus(),
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: response,
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && response && 'message' in response
          ? String((response as { message: unknown }).message)
          : exception.message;

      return {
        statusCode: exception.getStatus(),
        code: exception.constructor.name.replace('Exception', '').toUpperCase(),
        message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
    };
  }
}
