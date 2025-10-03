import { QueryFailedError } from 'typeorm';
import { DomainError } from './domain-error';
import { ErrorCodes } from './error-codes';

function getStr(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === 'object') {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

export function mapDbError(err: unknown): never {
  if (err instanceof QueryFailedError) {
    const drv: unknown = (err as QueryFailedError).driverError;

    const code = getStr(drv, 'code'); // p.ej. '23505'
    const detail = getStr(drv, 'detail');
    const constraint = getStr(drv, 'constraint');
    const schema = getStr(drv, 'schema');
    const table = getStr(drv, 'table');
    const column = getStr(drv, 'column');
    const drvMsg = getStr(drv, 'message');

    if (code === '23505') {
      throw new DomainError(ErrorCodes.DB_UNIQUE_VIOLATION, 'Unique constraint', {
        detail,
        constraint,
        table,
        column,
        schema,
      });
    }

    if (code === '23503') {
      throw new DomainError(ErrorCodes.DB_ERROR, 'Foreign key violation', {
        detail,
        constraint,
        table,
        column,
        schema,
      });
    }

    if (code === '23502') {
      throw new DomainError(ErrorCodes.DB_ERROR, 'Not null violation', {
        detail,
        table,
        column,
        schema,
      });
    }

    throw new DomainError(ErrorCodes.DB_ERROR, 'Database error', {
      code,
      message: drvMsg ?? err.message,
      detail,
      constraint,
      table,
      column,
      schema,
    });
  }

  throw err instanceof Error ? err : new Error(String(err));
}
