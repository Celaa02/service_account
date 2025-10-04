 
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../errors/domain-error';
import { ErrorCodes, ErrorCode } from '../errors/error-codes';

type HttpErrorBody = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
};

const ERROR_CODES_SET = new Set<string>(Object.values(ErrorCodes)); // evita cast a string[]

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let code: ErrorCode = ErrorCodes.UNEXPECTED;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const raw = exception.getResponse(); // string | object
      if (typeof raw === 'string') {
        // HttpException con string plano
        message = raw ?? exception.message;
      } else if (raw && typeof raw === 'object') {
        const body = raw as HttpErrorBody;

        // code (si viene y es conocido)
        if (typeof body.code === 'string' && ERROR_CODES_SET.has(body.code)) {
          code = body.code as ErrorCode;
        }

        // message (si viene como string)
        if (typeof body.message === 'string') {
          message = body.message;
        } else {
          message = exception.message ?? message;
        }

        // details (puede ser cualquier cosa)
        details = body.details;
      } else {
        // fallback
        message = exception.message ?? message;
      }
    } else if (exception instanceof DomainError) {
      const map: Partial<Record<ErrorCode, number>> = {
        [ErrorCodes.EMAIL_ALREADY_REGISTERED]: HttpStatus.CONFLICT,
        [ErrorCodes.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
        [ErrorCodes.ACCOUNT_NOT_FOUND]: HttpStatus.NOT_FOUND,
        [ErrorCodes.ACCOUNT_NUMBER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
        [ErrorCodes.INVALID_AMOUNT]: HttpStatus.BAD_REQUEST,
        [ErrorCodes.INSUFFICIENT_FUNDS]: HttpStatus.BAD_REQUEST,
        [ErrorCodes.DB_UNIQUE_VIOLATION]: HttpStatus.CONFLICT,
        [ErrorCodes.DB_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
        [ErrorCodes.ACCOUNT_NOT_OWNED]: HttpStatus.FORBIDDEN,
        [ErrorCodes.EMAIL_ALREADY_REGISTERGED]: HttpStatus.CONFLICT,
        // agrega aquí otros códigos si los tienes (p. ej. ACCOUNT_NOT_OWNED, TRANSFER_SAME_ACCOUNT, etc.)
      };
      code = exception.code;
      status = map[code] ?? HttpStatus.BAD_REQUEST;
      message =
        typeof exception.message === 'string' && exception.message.length > 0
          ? exception.message
          : code;
      details = exception.meta;
    } else if (exception instanceof Error) {
      message = exception.message ?? message;
    }

    res.status(status).json({
      statusCode: status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
