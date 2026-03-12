/**
 * Tests for schemaMapper utility
 */
import { mapConfigToSchema, getFieldsBySection, type MappedSchema } from '../schemaMapper';
import type { AssetTypeConfig, FieldConfig, SectionConfig } from '../../types';

// Minimal test config
const createTestConfig = (
  fields: FieldConfig[],
  sections: SectionConfig[] = [{ key: 'basic', title: 'Basic', order: 1 }]
): AssetTypeConfig => ({
  type: 'model',
  label: 'Test Model',
  icon: 'SmartToy',
  description: 'Test',
  sections,
  fields,
  reviewSteps: [],
  activities: [
    { type: 'registration', label: 'Registration', description: 'Register', requiredFields: ['name'] },
  ],
});

describe('mapConfigToSchema', () => {
  it('should map a text field to JSON Schema string', () => {
    const config = createTestConfig([
      { key: 'name', label: 'Name', type: 'text', section: 'basic', required: true },
    ]);
    const result = mapConfigToSchema(config);

    expect(result.jsonSchema.properties).toBeDefined();
    const nameSchema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).name;
    expect(nameSchema.type).toBe('string');
    expect(nameSchema.title).toBe('Name');
    expect(result.jsonSchema.required).toContain('name');
  });

  it('should map a number field with min/max', () => {
    const config = createTestConfig([
      { key: 'size', label: 'Size', type: 'number', section: 'basic', min: 0, max: 100 },
    ]);
    const result = mapConfigToSchema(config);

    const sizeSchema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).size;
    expect(sizeSchema.type).toBe('number');
    expect(sizeSchema.minimum).toBe(0);
    expect(sizeSchema.maximum).toBe(100);
  });

  it('should map dropdown with options to enum', () => {
    const config = createTestConfig([
      {
        key: 'framework',
        label: 'Framework',
        type: 'dropdown',
        section: 'basic',
        options: [
          { label: 'TensorFlow', value: 'tf' },
          { label: 'PyTorch', value: 'pt' },
        ],
      },
    ]);
    const result = mapConfigToSchema(config);

    const fwSchema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).framework;
    expect(fwSchema.enum).toEqual(['tf', 'pt']);
    expect(fwSchema.enumNames).toEqual(['TensorFlow', 'PyTorch']);
  });

  it('should map checkbox to boolean', () => {
    const config = createTestConfig([
      { key: 'agree', label: 'Agree', type: 'checkbox', section: 'basic' },
    ]);
    const result = mapConfigToSchema(config);

    const schema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).agree;
    expect(schema.type).toBe('boolean');
  });

  it('should map date-range to object with startDate and endDate', () => {
    const config = createTestConfig([
      { key: 'period', label: 'Period', type: 'date-range', section: 'basic' },
    ]);
    const result = mapConfigToSchema(config);

    const schema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).period;
    expect(schema.type).toBe('object');
    expect((schema.properties as Record<string, unknown>)).toHaveProperty('startDate');
    expect((schema.properties as Record<string, unknown>)).toHaveProperty('endDate');
  });

  it('should map asset_relation (multiple) to array of strings', () => {
    const config = createTestConfig([
      { key: 'datasets', label: 'Datasets', type: 'asset_relation', section: 'basic', multiple: true },
    ]);
    const result = mapConfigToSchema(config);

    const schema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).datasets;
    expect(schema.type).toBe('array');
    expect((schema.items as Record<string, unknown>).type).toBe('string');
  });

  it('should map asset_url to object with url and isInternal', () => {
    const config = createTestConfig([
      { key: 'modelUrl', label: 'URL', type: 'asset_url', section: 'basic' },
    ]);
    const result = mapConfigToSchema(config);

    const schema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).modelUrl;
    expect(schema.type).toBe('object');
    expect((schema.properties as Record<string, unknown>)).toHaveProperty('url');
    expect((schema.properties as Record<string, unknown>)).toHaveProperty('isInternal');
  });

  it('should apply validation rules from config', () => {
    const config = createTestConfig([
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        section: 'basic',
        validations: [
          { type: 'minLength', value: 3, message: 'Min 3' },
          { type: 'maxLength', value: 100, message: 'Max 100' },
        ],
      },
    ]);
    const result = mapConfigToSchema(config);

    const schema = (result.jsonSchema.properties as Record<string, Record<string, unknown>>).name;
    expect(schema.minLength).toBe(3);
    expect(schema.maxLength).toBe(100);
  });

  it('should filter fields by activity visibleFields', () => {
    const config = createTestConfig([
      { key: 'name', label: 'Name', type: 'text', section: 'basic' },
      { key: 'desc', label: 'Description', type: 'textarea', section: 'basic' },
      { key: 'tags', label: 'Tags', type: 'tags', section: 'basic' },
    ]);
    config.activities = [
      { type: 'sharing', label: 'Sharing', description: 'Share', requiredFields: ['name'], visibleFields: ['name', 'desc'] },
    ];

    const result = mapConfigToSchema(config, 'sharing');

    expect(Object.keys(result.jsonSchema.properties as object)).toEqual(['name', 'desc']);
  });

  it('should set UI widget for custom field types', () => {
    const config = createTestConfig([
      { key: 'rel', label: 'Relations', type: 'asset_relation', section: 'basic' },
    ]);
    const result = mapConfigToSchema(config);

    expect(result.uiSchema.rel).toBeDefined();
    expect((result.uiSchema.rel as Record<string, unknown>)['ui:widget']).toBe('AssetRelationWidget');
  });

  it('should sort fields by section order then field order', () => {
    const config = createTestConfig(
      [
        { key: 'c', label: 'C', type: 'text', section: 's2', order: 1 },
        { key: 'a', label: 'A', type: 'text', section: 's1', order: 1 },
        { key: 'b', label: 'B', type: 'text', section: 's1', order: 2 },
      ],
      [
        { key: 's1', title: 'Section 1', order: 1 },
        { key: 's2', title: 'Section 2', order: 2 },
      ]
    );

    const result = mapConfigToSchema(config);
    const order = (result.uiSchema['ui:order'] as string[]).filter((k) => k !== '*');
    expect(order).toEqual(['a', 'b', 'c']);
  });
});

describe('getFieldsBySection', () => {
  it('should group fields by section', () => {
    const config = createTestConfig(
      [
        { key: 'a', label: 'A', type: 'text', section: 's1', order: 1 },
        { key: 'b', label: 'B', type: 'text', section: 's2', order: 1 },
        { key: 'c', label: 'C', type: 'text', section: 's1', order: 2 },
      ],
      [
        { key: 's1', title: 'Section 1', order: 1 },
        { key: 's2', title: 'Section 2', order: 2 },
      ]
    );

    const sections = getFieldsBySection(config);
    expect(sections.get('s1')?.length).toBe(2);
    expect(sections.get('s2')?.length).toBe(1);
  });
});
