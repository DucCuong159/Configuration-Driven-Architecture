/**
 * Asset Type Config Registry
 * Central export point for all asset type configurations.
 * To add a new asset type: import the JSON config and add to the registry.
 */
import type { AssetTypeConfig, AssetTypeName } from '../../types';
import modelConfig from './model.config.json';
import datasetConfig from './dataset.config.json';

/** Registry of all asset type configs */
export const assetTypeConfigs: Record<string, AssetTypeConfig> = {
  model: modelConfig as unknown as AssetTypeConfig,
  dataset: datasetConfig as unknown as AssetTypeConfig,
};

/**
 * Get config for a specific asset type
 */
export function getConfig(type: AssetTypeName): AssetTypeConfig | undefined {
  return assetTypeConfigs[type];
}

/**
 * Get all asset type keys
 */
export function getAssetTypeKeys(): AssetTypeName[] {
  return Object.keys(assetTypeConfigs) as AssetTypeName[];
}

/**
 * Get configs as array
 */
export function getAllConfigs(): AssetTypeConfig[] {
  return Object.values(assetTypeConfigs);
}

export default assetTypeConfigs;
