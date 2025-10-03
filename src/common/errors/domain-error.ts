import { ErrorCode } from './error-codes';

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
    public readonly meta?: any,
  ) {
    super(message ?? code);
  }
}
