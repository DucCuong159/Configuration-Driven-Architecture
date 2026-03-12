/**
 * CDA Config Loader
 * Loads asset type configurations from JSON files or API.
 * Caches configs in memory to avoid re-loading.
 */
import type { AssetTypeConfig, AssetTypeName } from '../types';

// Import all configs statically (Vite resolves JSON imports at build time)
import modelConfig from '../config/assetTypes/model.config.json';
import datasetConfig from '../config/assetTypes/dataset.config.json';

/** In-memory config cache */
const configCache = new Map<AssetTypeName, AssetTypeConfig>();

/** All statically-imported configs */
const staticConfigs: Record<string, AssetTypeConfig> = {
  model: modelConfig as unknown as AssetTypeConfig,
  dataset: datasetConfig as unknown as AssetTypeConfig,
};

/**
 * Initialize configs from static imports into cache
 */
function initializeCache(): void {
  if (configCache.size > 0) return;
  Object.entries(staticConfigs).forEach(([key, config]) => {
    configCache.set(key as AssetTypeName, config);
  });
}

/**
 * Get a specific asset type configuration
 * @param assetType - The asset type to load config for
 * @returns The asset type config, or null if not found
 */
export function getAssetTypeConfig(assetType: AssetTypeName): AssetTypeConfig | null {
  initializeCache();
  return configCache.get(assetType) ?? null;
}

/**
 * Get all available asset type configurations
 * @returns Map of all asset type configs
 */
export function getAllAssetTypeConfigs(): Map<AssetTypeName, AssetTypeConfig> {
  initializeCache();
  return new Map(configCache);
}

/**
 * Get list of all registered asset type names
 */
export function getRegisteredAssetTypes(): AssetTypeName[] {
  initializeCache();
  return Array.from(configCache.keys());
}

/**
 * Register a new asset type config at runtime (for dynamic loading from API)
 */
export function registerAssetTypeConfig(config: AssetTypeConfig): void {
  configCache.set(config.type, config);
}

/**
 * Clear config cache (useful for hot-reload)
 */
export function clearConfigCache(): void {
  configCache.clear();
}

/**
 * Load configs from API (for server-driven mode)
 */
export async function loadConfigsFromApi(apiUrl: string): Promise<void> {
  try {
    const response = await fetch(`${apiUrl}/api/config/asset-types`);
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      data.data.forEach((config: AssetTypeConfig) => {
        configCache.set(config.type, config);
      });
    }
  } catch (error) {
    console.warn('Failed to load configs from API, using static configs:', error);
    initializeCache();
  }
}
