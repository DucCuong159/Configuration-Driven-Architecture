/**
 * CDA Schema Mapper
 * Converts our custom AssetTypeConfig into RJSF-compatible JSON Schema + UI Schema.
 * This is the bridge between our business-friendly config format and the technical RJSF format.
 */
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type {
  AssetTypeConfig,
  FieldConfig,
  SectionConfig,
  ActivityType,
  FieldWidgetType,
} from '../types';

/** Result of schema mapping */
export interface MappedSchema {
  jsonSchema: RJSFSchema;
  uiSchema: UiSchema;
  formSections: SectionConfig[];
}

/**
 * Maps a FieldWidgetType to JSON Schema type + format
 */
function mapFieldTypeToJsonSchema(field: FieldConfig): Record<string, unknown> {
  const baseSchema: Record<string, unknown> = {};

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'password':
      baseSchema.type = 'string';
      if (field.type === 'email') baseSchema.format = 'email';
      break;

    case 'number':
      baseSchema.type = 'number';
      if (field.min !== undefined) baseSchema.minimum = field.min;
      if (field.max !== undefined) baseSchema.maximum = field.max;
      break;

    case 'date':
      baseSchema.type = 'string';
      baseSchema.format = 'date';
      break;

    case 'date-range':
      baseSchema.type = 'object';
      baseSchema.properties = {
        startDate: { type: 'string', format: 'date', title: 'Start Date' },
        endDate: { type: 'string', format: 'date', title: 'End Date' },
      };
      break;

    case 'dropdown':
      baseSchema.type = 'string';
      if (field.options?.length) {
        baseSchema.enum = field.options.map((o) => o.value);
      }
      break;

    case 'radio':
      baseSchema.type = 'string';
      if (field.options?.length) {
        baseSchema.enum = field.options.map((o) => o.value);
      }
      break;

    case 'checkbox':
      baseSchema.type = 'boolean';
      break;

    case 'switch':
      baseSchema.type = 'boolean';
      break;

    case 'asset_relation':
      if (field.multiple) {
        baseSchema.type = 'array';
        baseSchema.items = { type: 'string' };
      } else {
        baseSchema.type = 'string';
      }
      break;

    case 'asset_url':
      baseSchema.type = 'object';
      baseSchema.properties = {
        url: { type: 'string', title: 'URL' },
        isInternal: { type: 'boolean', title: 'Internal Hosting' },
      };
      break;

    case 'tags':
      baseSchema.type = 'array';
      baseSchema.items = { type: 'string' };
      break;

    case 'file_upload':
      baseSchema.type = 'string';
      baseSchema.format = 'data-url';
      break;

    default:
      baseSchema.type = 'string';
  }

  // Add validations to schema
  if (field.validations) {
    for (const v of field.validations) {
      switch (v.type) {
        case 'minLength':
          baseSchema.minLength = v.value;
          break;
        case 'maxLength':
          baseSchema.maxLength = v.value;
          break;
        case 'min':
          baseSchema.minimum = v.value;
          break;
        case 'max':
          baseSchema.maximum = v.value;
          break;
        case 'pattern':
          baseSchema.pattern = v.value;
          break;
      }
    }
  }

  if (field.defaultValue !== undefined) {
    baseSchema.default = field.defaultValue;
  }

  baseSchema.title = field.label;
  if (field.helpText) {
    baseSchema.description = field.helpText;
  }

  return baseSchema;
}

/**
 * Maps a FieldWidgetType to the RJSF widget string identifier
 */
function mapFieldTypeToWidget(fieldType: FieldWidgetType): string | undefined {
  const widgetMap: Partial<Record<FieldWidgetType, string>> = {
    textarea: 'textarea',
    password: 'password',
    email: 'email',
    radio: 'RadioWidget',
    checkbox: 'CheckboxWidget',
    switch: 'SwitchWidget',
    'date-range': 'DateRangeWidget',
    asset_relation: 'AssetRelationWidget',
    asset_url: 'AssetUrlWidget',
    tags: 'TagsWidget',
    file_upload: 'FileWidget',
  };
  return widgetMap[fieldType];
}

/**
 * Generate uiSchema options for a field
 */
function generateUiOptions(field: FieldConfig): Record<string, unknown> {
  const options: Record<string, unknown> = {};

  // Widget
  const widget = mapFieldTypeToWidget(field.type);
  if (widget) {
    options['ui:widget'] = widget;
  }

  // Enum names for dropdowns/radios
  if ((field.type === 'dropdown' || field.type === 'radio') && field.options?.length) {
    options['ui:enumNames'] = field.options.map((o) => o.label);
  }

  // Placeholder
  if (field.placeholder) {
    options['ui:placeholder'] = field.placeholder;
  }

  // Read only
  if (field.readOnly) {
    options['ui:readonly'] = true;
  }

  // Textarea rows
  if (field.type === 'textarea') {
    options['ui:options'] = { rows: 4 };
  }

  // Custom widget options (passed as ui:options)
  const customOptions: Record<string, unknown> = {};

  if (field.type === 'asset_relation') {
    customOptions.relatedAssetType = field.relatedAssetType ?? 'any';
    customOptions.multiple = field.multiple ?? false;
  }

  if (field.type === 'asset_url') {
    customOptions.showInternalCheckbox = field.showInternalCheckbox ?? false;
  }

  // Column span for grid layout
  if (field.colSpan) {
    customOptions.colSpan = field.colSpan;
  }

  // Field section
  if (field.section) {
    customOptions.section = field.section;
  }

  // Merge custom options
  if (Object.keys(customOptions).length > 0) {
    options['ui:options'] = {
      ...(options['ui:options'] as Record<string, unknown> | undefined),
      ...customOptions,
    };
  }

  return options;
}

/**
 * Main mapping function: Convert AssetTypeConfig → RJSF schemas
 * @param config - The asset type configuration
 * @param activityType - Optional: filter fields visible for a specific activity
 * @returns Mapped JSON Schema + UI Schema + sections
 */
export function mapConfigToSchema(
  config: AssetTypeConfig,
  activityType?: ActivityType
): MappedSchema {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const uiSchema: UiSchema = {};
  const uiOrder: string[] = [];

  // Find activity config if specified
  const activityConfig = activityType
    ? config.activities.find((a) => a.type === activityType)
    : null;

  // Get visible fields (if activity restricts them)
  const visibleFieldKeys = activityConfig?.visibleFields ?? null;

  // Sort fields by section order then field order
  const sortedFields = [...config.fields].sort((a, b) => {
    const sectionA = config.sections.find((s) => s.key === a.section);
    const sectionB = config.sections.find((s) => s.key === b.section);
    const sectionOrder = (sectionA?.order ?? 99) - (sectionB?.order ?? 99);
    if (sectionOrder !== 0) return sectionOrder;
    return (a.order ?? 99) - (b.order ?? 99);
  });

  for (const field of sortedFields) {
    // Skip fields not visible for this activity type
    if (visibleFieldKeys && !visibleFieldKeys.includes(field.key)) {
      continue;
    }

    // JSON Schema property
    properties[field.key] = mapFieldTypeToJsonSchema(field);

    // Required fields
    const isRequired =
      field.required ||
      (activityConfig?.requiredFields?.includes(field.key) ?? false);
    if (isRequired) {
      required.push(field.key);
    }

    // UI Schema
    uiSchema[field.key] = generateUiOptions(field);

    // UI ordering
    uiOrder.push(field.key);
  }

  // Set UI order
  uiSchema['ui:order'] = [...uiOrder, '*'];

  const jsonSchema: RJSFSchema = {
    type: 'object',
    title: config.label,
    description: config.description,
    properties,
    required: required.length > 0 ? required : undefined,
  };

  return {
    jsonSchema,
    uiSchema,
    formSections: config.sections.sort((a, b) => a.order - b.order),
  };
}

/**
 * Get fields grouped by section for sectioned form rendering
 */
export function getFieldsBySection(
  config: AssetTypeConfig,
  activityType?: ActivityType
): Map<string, FieldConfig[]> {
  const activityConfig = activityType
    ? config.activities.find((a) => a.type === activityType)
    : null;
  const visibleFieldKeys = activityConfig?.visibleFields ?? null;

  const sectionMap = new Map<string, FieldConfig[]>();

  for (const section of config.sections.sort((a, b) => a.order - b.order)) {
    sectionMap.set(section.key, []);
  }

  const sortedFields = [...config.fields].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  for (const field of sortedFields) {
    if (visibleFieldKeys && !visibleFieldKeys.includes(field.key)) continue;
    const sectionKey = field.section ?? '_default';
    if (!sectionMap.has(sectionKey)) {
      sectionMap.set(sectionKey, []);
    }
    sectionMap.get(sectionKey)!.push(field);
  }

  // Remove empty sections
  for (const [key, fields] of sectionMap) {
    if (fields.length === 0) sectionMap.delete(key);
  }

  return sectionMap;
}
