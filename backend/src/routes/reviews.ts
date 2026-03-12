/**
 * Review Routes - Manage asset review workflows
 */
import { Router } from 'express';
import { reviews, activities, assets, generateId, now } from '../data/mockData';

const router = Router();

/**
 * GET /api/reviews
 * List all reviews
 */
router.get('/', (req, res) => {
  let filtered = [...reviews];
  const { assetType, status } = req.query;

  if (assetType) filtered = filtered.filter((r) => r.assetType === assetType);
  if (status) filtered = filtered.filter((r) => r.overallStatus === status);

  // Enrich with activity and asset info
  const enriched = filtered.map((review) => {
    const activity = activities.find((a) => a.id === review.activityId);
    const asset = activity?.assetId ? assets.find((a) => a.id === activity.assetId) : null;
    return {
      ...review,
      activity: activity || null,
      asset: asset || null,
    };
  });

  res.json({ success: true, data: enriched });
});

/**
 * GET /api/reviews/:id
 */
router.get('/:id', (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const activity = activities.find((a) => a.id === review.activityId);
  const asset = activity?.assetId ? assets.find((a) => a.id === activity.assetId) : null;

  res.json({
    success: true,
    data: { ...review, activity, asset },
  });
});

/**
 * POST /api/reviews
 * Create a new review for an activity
 */
router.post('/', (req, res) => {
  const { activityId, assetType, steps } = req.body;

  if (!activityId || !steps || !Array.isArray(steps)) {
    return res.status(400).json({
      success: false,
      message: 'activityId and steps are required',
    });
  }

  const newReview = {
    id: generateId('rev'),
    activityId,
    assetType: assetType || 'model',
    steps: steps.map((step: { title: string; reviewerRole: string }, idx: number) => ({
      stepNumber: idx + 1,
      title: step.title,
      status: idx === 0 ? 'in_progress' : 'pending',
      reviewer: step.reviewerRole || 'admin',
      feedback: '',
      completedAt: null,
    })),
    currentStep: 1,
    overallStatus: 'in_progress',
    createdAt: now(),
    updatedAt: now(),
  };

  reviews.push(newReview);
  res.status(201).json({ success: true, data: newReview, message: 'Review created' });
});

/**
 * PUT /api/reviews/:id/steps/:stepNumber
 * Update a review step (approve/reject with feedback)
 */
router.put('/:id/steps/:stepNumber', (req, res) => {
  const reviewIdx = reviews.findIndex((r) => r.id === req.params.id);
  if (reviewIdx === -1) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const stepNum = parseInt(req.params.stepNumber, 10);
  const review = reviews[reviewIdx];
  const stepIdx = review.steps.findIndex((s) => s.stepNumber === stepNum);

  if (stepIdx === -1) {
    return res.status(404).json({ success: false, message: 'Review step not found' });
  }

  const { status, feedback } = req.body;

  // Update the step
  review.steps[stepIdx].status = status;
  review.steps[stepIdx].feedback = feedback || '';
  if (status === 'approved' || status === 'rejected') {
    review.steps[stepIdx].completedAt = now();
  }

  // Handle step transition
  if (status === 'approved') {
    // Move to next step if available
    if (stepIdx + 1 < review.steps.length) {
      review.currentStep = review.steps[stepIdx + 1].stepNumber;
      review.steps[stepIdx + 1].status = 'in_progress';
    } else {
      // All steps completed
      review.overallStatus = 'approved';

      // Update the associated activity and asset
      const activity = activities.find((a) => a.id === review.activityId);
      if (activity) {
        activity.status = 'completed';
        activity.updatedAt = now();

        if (activity.assetId) {
          const asset = assets.find((a) => a.id === activity.assetId);
          if (asset) {
            asset.status = 'approved';
            asset.updatedAt = now();
          }
        }
      }
    }
  } else if (status === 'rejected') {
    review.overallStatus = 'rejected';

    // Update activity status
    const activity = activities.find((a) => a.id === review.activityId);
    if (activity) {
      activity.status = 'submitted'; // Back to submitted for revision
      activity.updatedAt = now();
    }
  }

  review.updatedAt = now();

  res.json({ success: true, data: review, message: `Step ${stepNum} ${status}` });
});

export { router as reviewRoutes };
