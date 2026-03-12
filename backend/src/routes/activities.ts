/**
 * Activity Routes - Manage asset activities (registration, sharing, etc.)
 */
import { Router } from 'express';
import { activities, assets, generateId, now } from '../data/mockData';

const router = Router();

/**
 * GET /api/activities
 * List all activities with optional filters
 */
router.get('/', (req, res) => {
  let filtered = [...activities];
  const { assetType, activityType, status } = req.query;

  if (assetType) filtered = filtered.filter((a) => a.assetType === assetType);
  if (activityType) filtered = filtered.filter((a) => a.activityType === activityType);
  if (status) filtered = filtered.filter((a) => a.status === status);

  res.json({ success: true, data: filtered });
});

/**
 * GET /api/activities/:id
 */
router.get('/:id', (req, res) => {
  const activity = activities.find((a) => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ success: false, message: 'Activity not found' });
  }
  res.json({ success: true, data: activity });
});

/**
 * POST /api/activities
 * Create a new activity (e.g., registration)
 */
router.post('/', (req, res) => {
  const { assetType, activityType, formData } = req.body;

  if (!assetType || !activityType) {
    return res.status(400).json({
      success: false,
      message: 'assetType and activityType are required',
    });
  }

  // Create the activity
  const newActivity = {
    id: generateId('act'),
    assetId: null as string | null,
    assetType,
    activityType,
    status: 'draft',
    formData: formData || {},
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'current-user',
  };

  activities.push(newActivity);

  res.status(201).json({
    success: true,
    data: newActivity,
    message: 'Activity created',
  });
});

/**
 * PUT /api/activities/:id
 * Update activity (e.g., update form data)
 */
router.put('/:id', (req, res) => {
  const idx = activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Activity not found' });
  }

  const { formData, status } = req.body;
  if (formData) activities[idx].formData = { ...activities[idx].formData, ...formData };
  if (status) activities[idx].status = status;
  activities[idx].updatedAt = now();

  res.json({ success: true, data: activities[idx], message: 'Activity updated' });
});

/**
 * POST /api/activities/:id/submit
 * Submit activity for review - creates an asset and a review
 */
router.post('/:id/submit', (req, res) => {
  const idx = activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Activity not found' });
  }

  const activity = activities[idx];

  // Create asset from activity form data
  const newAsset = {
    id: generateId('asset'),
    type: activity.assetType,
    name: (activity.formData.name as string) || 'Untitled',
    data: activity.formData,
    status: 'pending_review',
    version: (activity.formData.version as string) || '1.0.0',
    createdAt: now(),
    updatedAt: now(),
    createdBy: activity.createdBy,
    tags: (activity.formData.tags as string[]) || [],
  };
  assets.push(newAsset);

  // Update activity
  activity.assetId = newAsset.id;
  activity.status = 'submitted';
  activity.updatedAt = now();

  res.json({
    success: true,
    data: { activity, asset: newAsset },
    message: 'Activity submitted for review',
  });
});

export { router as activityRoutes };
