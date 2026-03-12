/**
 * Asset Routes - CRUD operations for assets
 */
import { Router } from 'express';
import { assets, generateId, now } from '../data/mockData';

const router = Router();

/**
 * GET /api/assets
 * List all assets with optional filters
 * Query: ?type=model&status=published&search=resnet&page=1&pageSize=10
 */
router.get('/', (req, res) => {
  let filtered = [...assets];
  const { type, status, search, page = '1', pageSize = '20' } = req.query;

  if (type) filtered = filtered.filter((a) => a.type === type);
  if (status) filtered = filtered.filter((a) => a.status === status);
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const pageNum = parseInt(page as string, 10);
  const size = parseInt(pageSize as string, 10);
  const total = filtered.length;
  const start = (pageNum - 1) * size;
  const paged = filtered.slice(start, start + size);

  res.json({
    success: true,
    data: paged,
    pagination: {
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.ceil(total / size),
    },
  });
});

/**
 * GET /api/assets/:id
 * Get a single asset
 */
router.get('/:id', (req, res) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }
  res.json({ success: true, data: asset });
});

/**
 * POST /api/assets
 * Create a new asset
 */
router.post('/', (req, res) => {
  const { type, name, data, tags = [] } = req.body;

  if (!type || !name) {
    return res.status(400).json({
      success: false,
      message: 'Type and name are required',
      errors: [
        ...(!type ? [{ field: 'type', message: 'Asset type is required' }] : []),
        ...(!name ? [{ field: 'name', message: 'Asset name is required' }] : []),
      ],
    });
  }

  const newAsset = {
    id: generateId('asset'),
    type,
    name,
    data: data || {},
    status: 'draft',
    version: (data?.version as string) || '1.0.0',
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'current-user',
    tags: tags || [],
  };

  assets.push(newAsset);
  res.status(201).json({ success: true, data: newAsset, message: 'Asset created' });
});

/**
 * PUT /api/assets/:id
 * Update an asset
 */
router.put('/:id', (req, res) => {
  const idx = assets.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const { name, data, status, tags } = req.body;
  if (name) assets[idx].name = name;
  if (data) assets[idx].data = { ...assets[idx].data, ...data };
  if (status) assets[idx].status = status;
  if (tags) assets[idx].tags = tags;
  assets[idx].updatedAt = now();

  res.json({ success: true, data: assets[idx], message: 'Asset updated' });
});

/**
 * PUT /api/assets/:id/publish
 * Publish an asset to the library
 */
router.put('/:id/publish', (req, res) => {
  const idx = assets.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  assets[idx].status = 'published';
  assets[idx].updatedAt = now();

  res.json({ success: true, data: assets[idx], message: 'Asset published to library' });
});

/**
 * DELETE /api/assets/:id
 * Delete an asset
 */
router.delete('/:id', (req, res) => {
  const idx = assets.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const deleted = assets.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Asset deleted' });
});

/**
 * GET /api/assets/search/relations
 * Search assets for the AssetRelationWidget
 * Query: ?type=dataset&q=imagenet
 */
router.get('/search/relations', (req, res) => {
  const { type, q } = req.query;
  let filtered = [...assets];

  if (type && type !== 'any') {
    filtered = filtered.filter((a) => a.type === type);
  }

  if (q) {
    const query = (q as string).toLowerCase();
    filtered = filtered.filter((a) => a.name.toLowerCase().includes(query));
  }

  const results = filtered.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    version: a.version,
  }));

  res.json({ success: true, data: results });
});

export { router as assetRoutes };
