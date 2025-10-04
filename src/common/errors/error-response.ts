export type ErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path?: string;
};
