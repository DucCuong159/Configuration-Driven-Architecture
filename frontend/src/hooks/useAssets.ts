/**
 * useAssets - Custom hook wrapping asset store actions
 * Provides convenient access to asset-related operations and state.
 */
import { useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/assetStore';
import type { AssetFilters, AssetCreateInput, AssetUpdateInput, Asset } from '../types';

/**
 * Hook for fetching and managing assets
 */
export function useAssets(autoFetch: boolean = false, filters?: AssetFilters) {
  const assets = useAppStore((s) => s.assets);
  const loading = useAppStore((s) => s.assetsLoading);
  const error = useAppStore((s) => s.assetsError);
  const fetchAssets = useAppStore((s) => s.fetchAssets);
  const resetError = useAppStore((s) => s.resetError);

  useEffect(() => {
    if (autoFetch) {
      fetchAssets(filters);
    }
  }, [autoFetch]);

  return { assets, loading, error, fetchAssets, resetError };
}

/**
 * Hook for creating assets
 */
export function useCreateAsset() {
  const createAsset = useAppStore((s) => s.createAsset);
  const loading = useAppStore((s) => s.assetsLoading);

  const create = useCallback(
    async (data: AssetCreateInput): Promise<Asset> => {
      return createAsset(data);
    },
    [createAsset]
  );

  return { createAsset: create, loading };
}

/**
 * Hook for publishing assets
 */
export function usePublishAsset() {
  const publishAsset = useAppStore((s) => s.publishAsset);

  return { publishAsset };
}

/**
 * Hook for selected asset
 */
export function useSelectedAsset() {
  const selectedId = useAppStore((s) => s.selectedAssetId);
  const assets = useAppStore((s) => s.assets);
  const selectAsset = useAppStore((s) => s.selectAsset);

  const selectedAsset = selectedId ? assets.find((a) => a.id === selectedId) ?? null : null;

  return { selectedAsset, selectAsset };
}

/**
 * Hook for asset filters
 */
export function useAssetFilters() {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const fetchAssets = useAppStore((s) => s.fetchAssets);

  const applyFilters = useCallback(
    (newFilters: AssetFilters) => {
      setFilters(newFilters);
      fetchAssets(newFilters);
    },
    [setFilters, fetchAssets]
  );

  return { filters, setFilters, applyFilters };
}
