/**
 * Error Handler Middleware
 * Global error handling for Express routes.
 */
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
}

/**
 * Not Found handler
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

/**
 * Create an API error with status code
 */
export function createApiError(message: string, statusCode: number, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
