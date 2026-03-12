/**
 * CDA Custom Validators
 * RJSF custom validation functions for form fields.
 * Each validator follows RJSF's customValidate signature.
 */
import type { RJSFValidationError } from '@rjsf/utils';

type FormData = Record<string, unknown>;
type ErrorSchema = Record<string, { __errors?: string[] }>;

/**
 * Create an error helper to add errors to a specific field
 */
function addFieldError(
  errors: ErrorSchema,
  fieldKey: string,
  message: string
): ErrorSchema {
  if (!errors[fieldKey]) {
    errors[fieldKey] = { __errors: [] };
  }
  errors[fieldKey].__errors!.push(message);
  return errors;
}

/**
 * URL validator - supports http, https, s3 protocols
 */
export function urlValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string = 'url'
): ErrorSchema {
  const value = formData[fieldKey];
  if (typeof value === 'string' && value.length > 0) {
    const urlPattern = /^(https?:\/\/|s3:\/\/|gs:\/\/).+/i;
    if (!urlPattern.test(value)) {
      addFieldError(errors, fieldKey, 'Must be a valid URL (http://, https://, s3://, gs://)');
    }
  }
  return errors;
}

/**
 * Email validator
 */
export function emailValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string = 'email'
): ErrorSchema {
  const value = formData[fieldKey];
  if (typeof value === 'string' && value.length > 0) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      addFieldError(errors, fieldKey, 'Must be a valid email address');
    }
  }
  return errors;
}

/**
 * Version format validator (semver)
 */
export function versionValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string = 'version'
): ErrorSchema {
  const value = formData[fieldKey];
  if (typeof value === 'string' && value.length > 0) {
    const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
    if (!semverPattern.test(value)) {
      addFieldError(errors, fieldKey, 'Must follow semver format (e.g., 1.0.0 or 1.0.0-beta.1)');
    }
  }
  return errors;
}

/**
 * Cross-field validator for date ranges
 * Ensures endDate >= startDate
 */
export function dateRangeValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string = 'valid_period'
): ErrorSchema {
  const value = formData[fieldKey] as { startDate?: string; endDate?: string } | undefined;
  if (value?.startDate && value?.endDate) {
    if (new Date(value.endDate) < new Date(value.startDate)) {
      addFieldError(errors, fieldKey, 'End date must be after start date');
    }
  }
  return errors;
}

/**
 * Asset relation validator - ensures at least one relation is selected when required
 */
export function assetRelationValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string,
  minCount: number = 1
): ErrorSchema {
  const value = formData[fieldKey];
  if (Array.isArray(value)) {
    if (value.length < minCount) {
      addFieldError(
        errors,
        fieldKey,
        `At least ${minCount} relation(s) must be selected`
      );
    }
  }
  return errors;
}

/**
 * Asset URL validator - validates the URL object with internal checkbox
 */
export function assetUrlValidator(
  formData: FormData,
  errors: ErrorSchema,
  fieldKey: string
): ErrorSchema {
  const value = formData[fieldKey] as { url?: string; isInternal?: boolean } | undefined;
  if (value?.url && typeof value.url === 'string' && value.url.length > 0) {
    const urlPattern = /^(https?:\/\/|s3:\/\/|gs:\/\/).+/i;
    if (!urlPattern.test(value.url)) {
      addFieldError(errors, fieldKey, 'Must be a valid URL');
    }
  }
  return errors;
}

/**
 * Compose multiple validators into a single RJSF customValidate function
 */
export function composeValidators(
  ...validators: Array<(formData: FormData, errors: ErrorSchema) => ErrorSchema>
): (formData: FormData, errors: ErrorSchema) => ErrorSchema {
  return (formData: FormData, errors: ErrorSchema) => {
    let result = errors;
    for (const validator of validators) {
      result = validator(formData, result);
    }
    return result;
  };
}

/**
 * Create a custom validate function for RJSF based on field configurations
 */
export function createCustomValidator(
  fieldConfigs: Array<{ key: string; type: string; validations?: Array<{ type: string; validatorName?: string }> }>
): (formData: FormData, errors: RJSFValidationError[]) => RJSFValidationError[] {
  // For RJSF v5, customValidate receives (formData, errors) where errors is a proxy
  // We return errors as-is after adding to it
  return (_formData: FormData, errors: RJSFValidationError[]) => {
    // Custom validation logic can be added here per field config
    return errors;
  };
}
