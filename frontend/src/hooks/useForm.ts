/**
 * useForm - Custom hook for CDA form state management
 * Handles form data, validation, submission, and draft saving.
 */
import { useState, useCallback } from 'react';
import type { AssetTypeConfig, ActivityType, FieldConfig } from '../types';
import { resolveFieldStates, type FormFieldStates } from '../utils/fieldDependencyResolver';

interface UseFormOptions {
  config: AssetTypeConfig;
  activityType?: ActivityType;
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onSaveDraft?: (data: Record<string, unknown>) => void;
}

interface UseFormReturn {
  formData: Record<string, unknown>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  fieldStates: FormFieldStates;
  submitting: boolean;
  error: string | null;
  handleChange: (newData: Record<string, unknown>) => void;
  handleSubmit: () => Promise<void>;
  handleSaveDraft: () => void;
  resetForm: () => void;
  clearError: () => void;
  isDirty: boolean;
}

/**
 * Hook for managing CDA form state
 */
export function useForm({
  config,
  activityType,
  initialData = {},
  onSubmit,
  onSaveDraft,
}: UseFormOptions): UseFormReturn {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Resolve field states from dependencies
  const fieldStates = resolveFieldStates(config, formData);

  const handleChange = useCallback((newData: Record<string, unknown>) => {
    setFormData(newData);
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      setIsDirty(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [formData, onSubmit]);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft?.(formData);
  }, [formData, onSaveDraft]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setError(null);
    setIsDirty(false);
  }, [initialData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    formData,
    setFormData,
    fieldStates,
    submitting,
    error,
    handleChange,
    handleSubmit,
    handleSaveDraft,
    resetForm,
    clearError,
    isDirty,
  };
}

export default useForm;
