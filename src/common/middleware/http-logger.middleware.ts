import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') ?? 'unknown';

    this.logger.log(
      `Incoming request ${method} ${originalUrl} ip=${ip} userAgent="${userAgent}"`,
    );

    response.on('finish', () => {
      const duration = Date.now() - startedAt;

      this.logger.log(
        `Completed response ${method} ${originalUrl} status=${response.statusCode} duration=${duration}ms`,
      );
    });

    next();
  }
}
