/**
 * CDA Field Dependency Resolver
 * Manages field visibility, dynamic option loading, and cross-field interactions.
 * This is what makes "field A changes → field B updates" work purely from config.
 */
import type { FieldConfig, FieldDependency, AssetTypeConfig } from '../types';

/** Resolved state for a single field */
export interface FieldState {
  visible: boolean;
  enabled: boolean;
  options?: Array<{ label: string; value: string | number | boolean }>;
  value?: unknown;
}

/** Full resolved state for all fields */
export type FormFieldStates = Record<string, FieldState>;

/**
 * Evaluate a single dependency condition
 */
function evaluateCondition(
  dependency: FieldDependency,
  sourceValue: unknown
): boolean {
  switch (dependency.condition) {
    case 'equals':
      return sourceValue === dependency.value;

    case 'not_equals':
      return sourceValue !== dependency.value;

    case 'contains':
      if (typeof sourceValue === 'string' && typeof dependency.value === 'string') {
        return sourceValue.includes(dependency.value);
      }
      if (Array.isArray(sourceValue)) {
        return sourceValue.includes(dependency.value);
      }
      return false;

    case 'not_empty':
      return sourceValue !== null && sourceValue !== undefined && sourceValue !== '';

    case 'empty':
      return sourceValue === null || sourceValue === undefined || sourceValue === '';

    case 'in':
      if (Array.isArray(dependency.value)) {
        return dependency.value.includes(sourceValue as string | number | boolean);
      }
      return false;

    case 'not_in':
      if (Array.isArray(dependency.value)) {
        return !dependency.value.includes(sourceValue as string | number | boolean);
      }
      return true;

    default:
      return false;
  }
}

/**
 * Resolve all field states based on current form data
 * @param config - The asset type configuration
 * @param formData - Current form data values
 * @returns Resolved field states (visibility, enabled, dynamic options)
 */
export function resolveFieldStates(
  config: AssetTypeConfig,
  formData: Record<string, unknown>
): FormFieldStates {
  const states: FormFieldStates = {};

  // Initialize all fields as visible & enabled
  for (const field of config.fields) {
    states[field.key] = {
      visible: true,
      enabled: true,
    };
  }

  // Process dependencies
  for (const field of config.fields) {
    if (!field.dependencies || field.dependencies.length === 0) continue;

    for (const dep of field.dependencies) {
      const sourceValue = formData[dep.sourceField];
      const conditionMet = evaluateCondition(dep, sourceValue);

      switch (dep.action) {
        case 'show':
          // Field is hidden by default, shown when condition is met
          states[field.key].visible = conditionMet;
          break;

        case 'hide':
          // Field is shown by default, hidden when condition is met
          states[field.key].visible = !conditionMet;
          break;

        case 'enable':
          states[field.key].enabled = conditionMet;
          break;

        case 'disable':
          states[field.key].enabled = !conditionMet;
          break;

        case 'set_value':
          if (conditionMet && dep.targetValue !== undefined) {
            states[field.key].value = dep.targetValue;
          }
          break;

        case 'fetch_options':
          // Mark that options need to be fetched
          // The actual API call is handled by the form component
          if (conditionMet && dep.apiEndpoint) {
            states[field.key].options = undefined; // Will be populated async
          }
          break;
      }
    }
  }

  return states;
}

/**
 * Get fields that have dependencies on a given source field
 * Used to know which fields to re-evaluate when a field changes
 */
export function getDependentFields(
  config: AssetTypeConfig,
  sourceFieldKey: string
): FieldConfig[] {
  return config.fields.filter((field) =>
    field.dependencies?.some((dep) => dep.sourceField === sourceFieldKey)
  );
}

/**
 * Get all fields that need API-driven option updates based on current form data
 */
export function getFieldsNeedingOptionFetch(
  config: AssetTypeConfig,
  formData: Record<string, unknown>,
  changedField: string
): Array<{ field: FieldConfig; apiEndpoint: string; sourceValue: unknown }> {
  const results: Array<{
    field: FieldConfig;
    apiEndpoint: string;
    sourceValue: unknown;
  }> = [];

  for (const field of config.fields) {
    if (!field.dependencies) continue;

    for (const dep of field.dependencies) {
      if (
        dep.sourceField === changedField &&
        dep.action === 'fetch_options' &&
        dep.apiEndpoint
      ) {
        const sourceValue = formData[dep.sourceField];
        const conditionMet = evaluateCondition(dep, sourceValue);
        if (conditionMet) {
          results.push({
            field,
            apiEndpoint: dep.apiEndpoint,
            sourceValue,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Apply field states to JSON Schema - removes hidden fields from required array
 * and marks disabled fields as readonly
 */
export function applyFieldStatesToSchema(
  schema: Record<string, unknown>,
  uiSchema: Record<string, unknown>,
  fieldStates: FormFieldStates
): { schema: Record<string, unknown>; uiSchema: Record<string, unknown> } {
  const newSchema = JSON.parse(JSON.stringify(schema));
  const newUiSchema = JSON.parse(JSON.stringify(uiSchema));

  // Remove hidden fields from required
  if (Array.isArray(newSchema.required)) {
    newSchema.required = (newSchema.required as string[]).filter(
      (key) => fieldStates[key]?.visible !== false
    );
  }

  // Update ui:schema for each field
  for (const [key, state] of Object.entries(fieldStates)) {
    if (!state.visible) {
      if (!newUiSchema[key]) newUiSchema[key] = {};
      (newUiSchema[key] as Record<string, unknown>)['ui:widget'] = 'hidden';
    }

    if (!state.enabled) {
      if (!newUiSchema[key]) newUiSchema[key] = {};
      (newUiSchema[key] as Record<string, unknown>)['ui:disabled'] = true;
    }

    // Update options for dropdown fields
    if (state.options) {
      if (newSchema.properties && (newSchema.properties as Record<string, unknown>)[key]) {
        const prop = (newSchema.properties as Record<string, Record<string, unknown>>)[key];
        prop.enum = state.options.map((o) => o.value);
      }
      if (!newUiSchema[key]) newUiSchema[key] = {};
      (newUiSchema[key] as Record<string, unknown>)['ui:enumNames'] = state.options.map((o) => o.label);
    }
  }

  return { schema: newSchema, uiSchema: newUiSchema };
}
