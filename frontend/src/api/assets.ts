/**
 * Asset API Functions
 */
import apiClient from './client';
import type {
  Asset,
  Activity,
  Review,
  AssetCreateInput,
  AssetUpdateInput,
  AssetFilters,
  ApiResponse,
  PaginatedResponse,
  AssetTypeConfig,
} from '../types';

// ─── Config API ──────────────────────────────────────────

export async function fetchAssetTypeConfigs(): Promise<AssetTypeConfig[]> {
  const res = await apiClient.get<ApiResponse<AssetTypeConfig[]>>('/config/asset-types');
  return res.data.data;
}

export async function fetchInputFormats(
  inputType: string
): Promise<Array<{ label: string; value: string }>> {
  const res = await apiClient.get('/config/input-formats', { params: { inputType } });
  return res.data.data;
}

/**
 * Generic dynamic option fetcher for any config-driven API endpoint.
 * Used by field dependencies with action: 'fetch_options'.
 */
export async function fetchDynamicOptions(
  apiEndpoint: string,
  sourceValue: string
): Promise<Array<{ label: string; value: string }>> {
  const res = await apiClient.get(apiEndpoint, { params: { value: sourceValue } });
  return res.data.data;
}

// ─── Asset API ───────────────────────────────────────────

export async function fetchAssets(filters?: AssetFilters): Promise<PaginatedResponse<Asset>> {
  const res = await apiClient.get<PaginatedResponse<Asset>>('/assets', { params: filters });
  return res.data;
}

export async function fetchAsset(id: string): Promise<Asset> {
  const res = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
  return res.data.data;
}

export async function createAsset(data: AssetCreateInput): Promise<Asset> {
  const res = await apiClient.post<ApiResponse<Asset>>('/assets', data);
  return res.data.data;
}

export async function updateAsset(id: string, data: AssetUpdateInput): Promise<Asset> {
  const res = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, data);
  return res.data.data;
}

export async function publishAsset(id: string): Promise<Asset> {
  const res = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}/publish`);
  return res.data.data;
}

export async function deleteAsset(id: string): Promise<void> {
  await apiClient.delete(`/assets/${id}`);
}

export async function searchAssetRelations(
  type?: string,
  query?: string
): Promise<Array<{ id: string; name: string; type: string; version: string }>> {
  const res = await apiClient.get('/assets/search/relations', {
    params: { type, q: query },
  });
  return res.data.data;
}

// ─── Activity API ────────────────────────────────────────

export async function fetchActivities(
  filters?: Record<string, string>
): Promise<Activity[]> {
  const res = await apiClient.get<ApiResponse<Activity[]>>('/activities', { params: filters });
  return res.data.data;
}

export async function fetchActivity(id: string): Promise<Activity> {
  const res = await apiClient.get<ApiResponse<Activity>>(`/activities/${id}`);
  return res.data.data;
}

export async function createActivity(data: {
  assetType: string;
  activityType: string;
  formData?: Record<string, unknown>;
}): Promise<Activity> {
  const res = await apiClient.post<ApiResponse<Activity>>('/activities', data);
  return res.data.data;
}

export async function updateActivity(
  id: string,
  data: { formData?: Record<string, unknown>; status?: string }
): Promise<Activity> {
  const res = await apiClient.put<ApiResponse<Activity>>(`/activities/${id}`, data);
  return res.data.data;
}

export async function submitActivity(
  id: string
): Promise<{ activity: Activity; asset: Asset }> {
  const res = await apiClient.post<ApiResponse<{ activity: Activity; asset: Asset }>>(
    `/activities/${id}/submit`
  );
  return res.data.data;
}

// ─── Review API ──────────────────────────────────────────

export async function fetchReviews(
  filters?: Record<string, string>
): Promise<Array<Review & { activity: Activity | null; asset: Asset | null }>> {
  const res = await apiClient.get<
    ApiResponse<Array<Review & { activity: Activity | null; asset: Asset | null }>>
  >('/reviews', { params: filters });
  return res.data.data;
}

export async function fetchReview(
  id: string
): Promise<Review & { activity: Activity; asset: Asset }> {
  const res = await apiClient.get<
    ApiResponse<Review & { activity: Activity; asset: Asset }>
  >(`/reviews/${id}`);
  return res.data.data;
}

export async function createReview(data: {
  activityId: string;
  assetType: string;
  steps: Array<{ title: string; reviewerRole: string }>;
}): Promise<Review> {
  const res = await apiClient.post<ApiResponse<Review>>('/reviews', data);
  return res.data.data;
}

export async function updateReviewStep(
  reviewId: string,
  stepNumber: number,
  data: { status: string; feedback?: string }
): Promise<Review> {
  const res = await apiClient.put<ApiResponse<Review>>(
    `/reviews/${reviewId}/steps/${stepNumber}`,
    data
  );
  return res.data.data;
}
