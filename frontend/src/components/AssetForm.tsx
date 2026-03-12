/**
 * AssetForm - Dynamic form rendered from configuration
 * This is the core CDA component that converts JSON config → working form.
 */
import React, { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent } from '@rjsf/core';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';

import type { AssetTypeConfig, ActivityType } from '../types';
import { mapConfigToSchema, getFieldsBySection } from '../utils/schemaMapper';
import {
  resolveFieldStates,
  applyFieldStatesToSchema,
  getFieldsNeedingOptionFetch,
} from '../utils/fieldDependencyResolver';
import { customWidgets } from '../schemas';
import { fetchDynamicOptions } from '../api/assets';

interface AssetFormProps {
  config: AssetTypeConfig;
  activityType?: ActivityType;
  initialData?: Record<string, unknown>;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({
  config,
  activityType,
  initialData,
  onSubmit,
  submitLabel = 'Submit',
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData || {});
  const deferredFormData = useDeferredValue(formData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, Array<{ label: string; value: string }>>
  >({});

  // Generate base schema from config
  const { jsonSchema, uiSchema } = useMemo(
    () => mapConfigToSchema(config, activityType),
    [config, activityType],
  );

  // Get fields by section for accordion layout
  const fieldsBySection = useMemo(
    () => getFieldsBySection(config, activityType),
    [config, activityType],
  );

  // Resolve field states (show/hide/enable/disable)
  const fieldStates = useMemo(
    () => resolveFieldStates(config, deferredFormData),
    [config, deferredFormData],
  );

  // Apply field states + dynamic options to schema
  const { schema: resolvedSchema, uiSchema: resolvedUiSchema } = useMemo(() => {
    const result = applyFieldStatesToSchema(jsonSchema, uiSchema, fieldStates);

    // Apply dynamic options to schema
    for (const [fieldKey, options] of Object.entries(dynamicOptions)) {
      if (
        result.schema.properties &&
        (result.schema.properties as Record<string, Record<string, unknown>>)[fieldKey]
      ) {
        const prop = (result.schema.properties as Record<string, Record<string, unknown>>)[
          fieldKey
        ];
        prop.enum = options.map((o) => o.value);
        prop.enumNames = options.map((o) => o.label);
      }
    }

    return result;
  }, [jsonSchema, uiSchema, fieldStates, dynamicOptions]);

  // Handle form data change - check for field dependencies
  const handleChange = useCallback(
    (e: IChangeEvent) => {
      const newData = e.formData as Record<string, unknown>;
      setFormData(newData);

      // Check if any field changes trigger dynamic option fetching
      const changedKeys = Object.keys(newData).filter((key) => newData[key] !== formData[key]);

      for (const changedKey of changedKeys) {
        const fieldsToFetch = getFieldsNeedingOptionFetch(config, newData, changedKey);
        for (const { field, apiEndpoint, sourceValue } of fieldsToFetch) {
          // Generic dynamic option fetching using apiEndpoint from config
          if (typeof sourceValue === 'string' && apiEndpoint) {
            fetchDynamicOptions(apiEndpoint, sourceValue).then((options) => {
              setDynamicOptions((prev) => ({
                ...prev,
                [field.key]: options,
              }));
            });
          }
        }
      }
    },
    [config, formData],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: IChangeEvent) => {
      setSubmitting(true);
      setError(null);
      try {
        await onSubmit(data.formData as Record<string, unknown>);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit],
  );

  // Initialize dynamic options for fields that depend on initial data
  useEffect(() => {
    if (initialData?.input_type && typeof initialData.input_type === 'string') {
      fetchDynamicOptions('/api/config/input-formats', initialData.input_type as string).then(
        (options) => {
          setDynamicOptions((prev) => ({ ...prev, input_format: options }));
        },
      );
    }
  }, [initialData]);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form
        schema={resolvedSchema}
        uiSchema={{
          ...resolvedUiSchema,
          'ui:submitButtonOptions': { norender: true },
        }}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        validator={validator}
        widgets={customWidgets}
        readonly={readOnly}
        liveValidate={false}
        showErrorList={false}
        noHtml5Validate
      >
        {/* Custom submit area */}
        {!readOnly && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={18} /> : <SendIcon />}
              disabled={submitting}
              sx={{ minWidth: 140 }}
            >
              {submitting ? 'Submitting...' : submitLabel}
            </Button>
          </Box>
        )}
      </Form>
    </Box>
  );
};

export default AssetForm;
