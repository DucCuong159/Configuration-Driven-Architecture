/**
 * Config Routes - Serves asset type configurations
 * These endpoints provide the JSON configs that drive the frontend forms.
 */
import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { inputFormatOptions } from '../data/mockData';

const router = Router();

/**
 * Load all config files from the frontend config directory
 * In production, these would come from a database or config service
 */
function loadAllConfigs(): Record<string, unknown>[] {
  const configDir = path.resolve(__dirname, '../../../frontend/src/config/assetTypes');
  const configs: Record<string, unknown>[] = [];

  try {
    const files = fs.readdirSync(configDir);
    for (const file of files) {
      if (file.endsWith('.config.json')) {
        const content = fs.readFileSync(path.join(configDir, file), 'utf-8');
        configs.push(JSON.parse(content));
      }
    }
  } catch (error) {
    console.error('Failed to load configs:', error);
  }

  return configs;
}

/**
 * GET /api/config/asset-types
 * Returns all asset type configurations
 */
router.get('/asset-types', (_req, res) => {
  const configs = loadAllConfigs();
  res.json({
    success: true,
    data: configs,
    message: `Loaded ${configs.length} asset type configurations`,
  });
});

/**
 * GET /api/config/asset-types/:type
 * Returns a specific asset type configuration
 */
router.get('/asset-types/:type', (req, res) => {
  const { type } = req.params;
  const configs = loadAllConfigs();
  const config = configs.find((c: Record<string, unknown>) => c.type === type);

  if (!config) {
    return res.status(404).json({
      success: false,
      message: `Asset type '${type}' not found`,
    });
  }

  res.json({ success: true, data: config });
});

/**
 * GET /api/config/input-formats
 * Returns input format options based on input type (for field dependencies)
 * Query: ?inputType=image
 */
router.get('/input-formats', (req, res) => {
  const inputType = req.query.inputType as string;

  if (!inputType) {
    return res.json({
      success: true,
      data: [],
      message: 'No inputType specified',
    });
  }

  const formats = inputFormatOptions[inputType] || [];
  res.json({
    success: true,
    data: formats,
    message: `${formats.length} formats for ${inputType}`,
  });
});

export { router as configRoutes };
