import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/api-response.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.getMessage(exceptionResponse);
    const errors = this.getErrors(exceptionResponse);

    this.logException(exception, request, status, message);

    response.status(status).json({
      success: false,
      message,
      errors,
    } satisfies ApiResponse);
  }

  private getMessage(exceptionResponse: unknown): string {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      return Array.isArray(message) ? 'Validation Error' : String(message);
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    return 'Internal Server Error';
  }

  private getErrors(exceptionResponse: unknown): unknown[] {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse.message)
    ) {
      return exceptionResponse.message;
    }

    return [];
  }

  private logException(
    exception: unknown,
    request: Request,
    status: number,
    message: string,
  ): void {
    const logMessage = `Request failed ${request.method} ${request.originalUrl} status=${status} message="${message}"`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
      return;
    }

    this.logger.warn(logMessage);
  }
}
