/**
 * Tests for fieldDependencyResolver utility
 */
import {
  resolveFieldStates,
  getDependentFields,
  getFieldsNeedingOptionFetch,
  applyFieldStatesToSchema,
} from '../fieldDependencyResolver';
import type { AssetTypeConfig, FieldConfig } from '../../types';

const createConfig = (fields: FieldConfig[]): AssetTypeConfig => ({
  type: 'model',
  label: 'Test',
  icon: 'SmartToy',
  description: 'Test',
  sections: [{ key: 'basic', title: 'Basic', order: 1 }],
  fields,
  reviewSteps: [],
  activities: [],
});

describe('resolveFieldStates', () => {
  it('should show all fields by default', () => {
    const config = createConfig([
      { key: 'name', label: 'Name', type: 'text', section: 'basic' },
      { key: 'desc', label: 'Description', type: 'textarea', section: 'basic' },
    ]);

    const states = resolveFieldStates(config, {});
    expect(states.name.visible).toBe(true);
    expect(states.name.enabled).toBe(true);
    expect(states.desc.visible).toBe(true);
  });

  it('should hide field when show condition is not met', () => {
    const config = createConfig([
      { key: 'isPretrained', label: 'Pre-trained', type: 'checkbox', section: 'basic' },
      {
        key: 'source',
        label: 'Source',
        type: 'text',
        section: 'basic',
        dependencies: [
          { sourceField: 'isPretrained', condition: 'equals', value: true, action: 'show' },
        ],
      },
    ]);

    const states = resolveFieldStates(config, { isPretrained: false });
    expect(states.source.visible).toBe(false);
  });

  it('should show field when show condition is met', () => {
    const config = createConfig([
      { key: 'isPretrained', label: 'Pre-trained', type: 'checkbox', section: 'basic' },
      {
        key: 'source',
        label: 'Source',
        type: 'text',
        section: 'basic',
        dependencies: [
          { sourceField: 'isPretrained', condition: 'equals', value: true, action: 'show' },
        ],
      },
    ]);

    const states = resolveFieldStates(config, { isPretrained: true });
    expect(states.source.visible).toBe(true);
  });

  it('should handle "in" condition', () => {
    const config = createConfig([
      { key: 'level', label: 'Level', type: 'dropdown', section: 'basic' },
      {
        key: 'nda',
        label: 'NDA',
        type: 'switch',
        section: 'basic',
        dependencies: [
          { sourceField: 'level', condition: 'in', value: ['restricted', 'confidential'], action: 'show' },
        ],
      },
    ]);

    expect(resolveFieldStates(config, { level: 'public' }).nda.visible).toBe(false);
    expect(resolveFieldStates(config, { level: 'restricted' }).nda.visible).toBe(true);
    expect(resolveFieldStates(config, { level: 'confidential' }).nda.visible).toBe(true);
  });

  it('should handle "not_empty" condition', () => {
    const config = createConfig([
      { key: 'input', label: 'Input', type: 'text', section: 'basic' },
      {
        key: 'format',
        label: 'Format',
        type: 'dropdown',
        section: 'basic',
        dependencies: [
          { sourceField: 'input', condition: 'not_empty', value: null, action: 'show' },
        ],
      },
    ]);

    expect(resolveFieldStates(config, {}).format.visible).toBe(false);
    expect(resolveFieldStates(config, { input: '' }).format.visible).toBe(false);
    expect(resolveFieldStates(config, { input: 'text' }).format.visible).toBe(true);
  });

  it('should handle "hide" action (inverse of show)', () => {
    const config = createConfig([
      { key: 'flag', label: 'Flag', type: 'checkbox', section: 'basic' },
      {
        key: 'hidden',
        label: 'Hidden',
        type: 'text',
        section: 'basic',
        dependencies: [
          { sourceField: 'flag', condition: 'equals', value: true, action: 'hide' },
        ],
      },
    ]);

    expect(resolveFieldStates(config, { flag: false }).hidden.visible).toBe(true);
    expect(resolveFieldStates(config, { flag: true }).hidden.visible).toBe(false);
  });

  it('should disable field with "disable" action', () => {
    const config = createConfig([
      { key: 'locked', label: 'Locked', type: 'checkbox', section: 'basic' },
      {
        key: 'field',
        label: 'Field',
        type: 'text',
        section: 'basic',
        dependencies: [
          { sourceField: 'locked', condition: 'equals', value: true, action: 'disable' },
        ],
      },
    ]);

    expect(resolveFieldStates(config, { locked: true }).field.enabled).toBe(false);
    expect(resolveFieldStates(config, { locked: false }).field.enabled).toBe(true);
  });
});

describe('getDependentFields', () => {
  it('should return fields that depend on a given source', () => {
    const config = createConfig([
      { key: 'type', label: 'Type', type: 'dropdown', section: 'basic' },
      {
        key: 'a',
        label: 'A',
        type: 'text',
        section: 'basic',
        dependencies: [{ sourceField: 'type', condition: 'equals', value: 'x', action: 'show' }],
      },
      { key: 'b', label: 'B', type: 'text', section: 'basic' },
    ]);

    const deps = getDependentFields(config, 'type');
    expect(deps.length).toBe(1);
    expect(deps[0].key).toBe('a');
  });
});

describe('getFieldsNeedingOptionFetch', () => {
  it('should return fields with fetch_options when source changes', () => {
    const config = createConfig([
      { key: 'input_type', label: 'Input', type: 'dropdown', section: 'basic' },
      {
        key: 'format',
        label: 'Format',
        type: 'dropdown',
        section: 'basic',
        dependencies: [
          {
            sourceField: 'input_type',
            condition: 'not_empty',
            value: null,
            action: 'fetch_options',
            apiEndpoint: '/api/config/formats',
          },
        ],
      },
    ]);

    const result = getFieldsNeedingOptionFetch(config, { input_type: 'text' }, 'input_type');
    expect(result.length).toBe(1);
    expect(result[0].field.key).toBe('format');
    expect(result[0].apiEndpoint).toBe('/api/config/formats');
  });

  it('should return empty when source is empty', () => {
    const config = createConfig([
      { key: 'src', label: 'Src', type: 'dropdown', section: 'basic' },
      {
        key: 'target',
        label: 'Target',
        type: 'dropdown',
        section: 'basic',
        dependencies: [
          {
            sourceField: 'src',
            condition: 'not_empty',
            value: null,
            action: 'fetch_options',
            apiEndpoint: '/api/test',
          },
        ],
      },
    ]);

    const result = getFieldsNeedingOptionFetch(config, { src: '' }, 'src');
    expect(result.length).toBe(0);
  });
});

describe('applyFieldStatesToSchema', () => {
  it('should set hidden widget for invisible fields', () => {
    const schema = { properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a', 'b'] };
    const uiSchema = {};
    const states = { a: { visible: true, enabled: true }, b: { visible: false, enabled: true } };

    const result = applyFieldStatesToSchema(schema, uiSchema, states);
    expect((result.uiSchema as Record<string, Record<string, unknown>>).b['ui:widget']).toBe('hidden');
  });

  it('should remove hidden fields from required', () => {
    const schema = { properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a', 'b'] };
    const uiSchema = {};
    const states = { a: { visible: true, enabled: true }, b: { visible: false, enabled: true } };

    const result = applyFieldStatesToSchema(schema, uiSchema, states);
    expect(result.schema.required).toEqual(['a']);
  });

  it('should set ui:disabled for disabled fields', () => {
    const schema = { properties: { a: { type: 'string' } } };
    const uiSchema = {};
    const states = { a: { visible: true, enabled: false } };

    const result = applyFieldStatesToSchema(schema, uiSchema, states);
    expect((result.uiSchema as Record<string, Record<string, unknown>>).a['ui:disabled']).toBe(true);
  });
});
