export type ErrorResponse = {
  statusCode: number; // http status
  code: string; // APP error code (estable)
  message: string; // breve para humanos
  details?: unknown; // opcional (violations, ids, etc.)
  timestamp: string; // ISO
  path?: string; // ruta
};
