/**
 * Validation Middleware
 * Request validation using JSON Schema (AJV-style validation).
 */
import { Request, Response, NextFunction } from 'express';
import { createApiError } from './errorHandler';

interface ValidationRule {
  field: string;
  type: 'required' | 'string' | 'number' | 'array' | 'enum';
  values?: string[];
  message?: string;
}

/**
 * Validate request body against a set of rules
 */
export function validateBody(rules: ValidationRule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} is required`,
            });
          }
          break;

        case 'string':
          if (value !== undefined && typeof value !== 'string') {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be a string`,
            });
          }
          break;

        case 'number':
          if (value !== undefined && typeof value !== 'number') {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be a number`,
            });
          }
          break;

        case 'array':
          if (value !== undefined && !Array.isArray(value)) {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be an array`,
            });
          }
          break;

        case 'enum':
          if (value !== undefined && rule.values && !rule.values.includes(value)) {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be one of: ${rule.values.join(', ')}`,
            });
          }
          break;
      }
    }

    if (errors.length > 0) {
      next(createApiError('Validation failed', 400, errors));
      return;
    }

    next();
  };
}

/**
 * Validate that request body is valid JSON
 */
export function validateJson(req: Request, _res: Response, next: NextFunction): void {
  if (req.headers['content-type']?.includes('application/json') && !req.body) {
    next(createApiError('Invalid JSON in request body', 400));
    return;
  }
  next();
}
