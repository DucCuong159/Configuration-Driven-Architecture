/* ============================================================
 * CDA Asset Management System - Core Type Definitions
 * All TypeScript interfaces for the configuration-driven architecture
 * ============================================================ */

// ─── Asset Types ───────────────────────────────────────────
export type AssetTypeName = 'model' | 'dataset' | 'agent' | 'service' | 'sw_component' | 'app' | 'product';

export type AssetStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'published' | 'rejected' | 'archived';

export type ActivityType = 'registration' | 'sharing' | 'purchase' | 'update' | 'deprecation' | 'transfer' | 'clone';

export type ActivityStatus = 'draft' | 'submitted' | 'in_review' | 'completed' | 'cancelled';

export type ReviewStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_revision';

// ─── Asset Core ────────────────────────────────────────────
export interface Asset {
  id: string;
  type: AssetTypeName;
  name: string;
  data: Record<string, unknown>;
  status: AssetStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

// ─── Activity ──────────────────────────────────────────────
export interface Activity {
  id: string;
  assetId: string | null;
  assetType: AssetTypeName;
  activityType: ActivityType;
  status: ActivityStatus;
  formData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ─── Review ────────────────────────────────────────────────
export interface ReviewStep {
  stepNumber: number;
  title: string;
  status: ReviewStatus;
  reviewer: string;
  feedback: string;
  completedAt: string | null;
}

export interface Review {
  id: string;
  activityId: string;
  assetType: AssetTypeName;
  steps: ReviewStep[];
  currentStep: number;
  overallStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Configuration Types (CDA Core) ───────────────────────

/** Supported field widget types */
export type FieldWidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'date-range'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'asset_relation'
  | 'asset_url'
  | 'tags'
  | 'file_upload';

/** Field dependency rule - controls show/hide and dynamic updates */
export interface FieldDependency {
  /** The field this depends on */
  sourceField: string;
  /** Condition type */
  condition: 'equals' | 'not_equals' | 'contains' | 'not_empty' | 'empty' | 'in' | 'not_in';
  /** Value(s) to match */
  value: unknown;
  /** What happens when condition is met */
  action: 'show' | 'hide' | 'enable' | 'disable' | 'set_value' | 'fetch_options';
  /** For fetch_options: API endpoint to call */
  apiEndpoint?: string;
  /** For set_value: the value to set */
  targetValue?: unknown;
}

/** Validation rule for a field */
export interface FieldValidation {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: unknown;
  message: string;
  /** For custom validators: validator function name */
  validatorName?: string;
}

/** Single field configuration in an asset type */
export interface FieldConfig {
  /** Unique field identifier */
  key: string;
  /** Display label */
  label: string;
  /** Widget type to render */
  type: FieldWidgetType;
  /** Placeholder text */
  placeholder?: string;
  /** Help text displayed below field */
  helpText?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Field ordering (lower = first) */
  order?: number;
  /** Logical group for sectioning */
  section?: string;
  /** Width span (1-12, grid-based) */
  colSpan?: number;

  // Type-specific options
  /** For dropdown/radio: available options */
  options?: Array<{ label: string; value: string | number | boolean }>;
  /** For number: min/max */
  min?: number;
  max?: number;
  /** For asset_relation: which asset type to relate to */
  relatedAssetType?: AssetTypeName | 'any';
  /** For asset_relation: allow multiple selections */
  multiple?: boolean;
  /** For asset_url: show internal hosting checkbox */
  showInternalCheckbox?: boolean;

  /** Validation rules */
  validations?: FieldValidation[];
  /** Field dependency rules */
  dependencies?: FieldDependency[];
}

/** Section grouping for form layout */
export interface SectionConfig {
  key: string;
  title: string;
  description?: string;
  order: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/** Review step configuration */
export interface ReviewStepConfig {
  stepNumber: number;
  title: string;
  description: string;
  reviewerRole: string;
  /** Fields to display in this review step */
  fields: string[];
  /** Fields that must be verified in this step */
  requiredFields: string[];
}

/** Activity type configuration */
export interface ActivityConfig {
  type: ActivityType;
  label: string;
  description: string;
  /** Which fields are required for this activity type */
  requiredFields: string[];
  /** Which fields are visible for this activity type */
  visibleFields?: string[];
}

/** Complete asset type configuration (the JSON config file) */
export interface AssetTypeConfig {
  /** Asset type identifier */
  type: AssetTypeName;
  /** Display name */
  label: string;
  /** Icon identifier (MUI icon name) */
  icon: string;
  /** Description */
  description: string;
  /** Form sections */
  sections: SectionConfig[];
  /** All fields for this asset type */
  fields: FieldConfig[];
  /** Review workflow steps */
  reviewSteps: ReviewStepConfig[];
  /** Supported activity types */
  activities: ActivityConfig[];
}

// ─── API Types ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AssetCreateInput {
  type: AssetTypeName;
  name: string;
  data: Record<string, unknown>;
  tags?: string[];
}

export interface AssetUpdateInput {
  name?: string;
  data?: Record<string, unknown>;
  status?: AssetStatus;
  tags?: string[];
}

export interface AssetFilters {
  type?: AssetTypeName;
  status?: AssetStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── Store Types ───────────────────────────────────────────
export interface AssetStoreState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  selectedAssetId: string | null;
  filters: AssetFilters;
}

export interface AssetStoreActions {
  fetchAssets: (filters?: AssetFilters) => Promise<void>;
  createAsset: (data: AssetCreateInput) => Promise<Asset>;
  updateAsset: (id: string, data: AssetUpdateInput) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  selectAsset: (id: string | null) => void;
  setFilters: (filters: AssetFilters) => void;
  resetError: () => void;
}

export type AssetStore = AssetStoreState & AssetStoreActions;
