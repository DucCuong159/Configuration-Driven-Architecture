/**
 * useActivities - Custom hook for activity workflow management
 * Provides convenient access to activity-related operations and state.
 */
import { useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/assetStore';
import type { AssetTypeName, ActivityType, Activity } from '../types';

/**
 * Hook for fetching activities
 */
export function useActivities(autoFetch: boolean = false) {
  const activities = useAppStore((s) => s.activities);
  const loading = useAppStore((s) => s.activitiesLoading);
  const fetchActivities = useAppStore((s) => s.fetchActivities);

  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [autoFetch]);

  return { activities, loading, fetchActivities };
}

/**
 * Hook for creating and submitting activities
 */
export function useCreateActivity() {
  const createActivity = useAppStore((s) => s.createActivity);
  const submitActivity = useAppStore((s) => s.submitActivity);
  const createReview = useAppStore((s) => s.createReview);

  const createAndSubmit = useCallback(
    async (params: {
      assetType: AssetTypeName;
      activityType: ActivityType;
      formData: Record<string, unknown>;
      reviewSteps?: Array<{ title: string; reviewerRole: string }>;
    }): Promise<Activity> => {
      // 1. Create the activity
      const activity = await createActivity({
        assetType: params.assetType,
        activityType: params.activityType,
        formData: params.formData,
      });

      // 2. Submit it (this creates the asset)
      await submitActivity(activity.id);

      // 3. Create review if review steps provided
      if (params.reviewSteps && params.reviewSteps.length > 0) {
        await createReview({
          activityId: activity.id,
          assetType: params.assetType,
          steps: params.reviewSteps,
        });
      }

      return activity;
    },
    [createActivity, submitActivity, createReview]
  );

  const saveDraft = useCallback(
    async (params: {
      assetType: string;
      activityType: string;
      formData: Record<string, unknown>;
    }): Promise<Activity> => {
      return createActivity(params);
    },
    [createActivity]
  );

  return { createAndSubmit, saveDraft };
}

/**
 * Hook for review operations
 */
export function useReviews(autoFetch: boolean = false) {
  const reviews = useAppStore((s) => s.reviews);
  const loading = useAppStore((s) => s.reviewsLoading);
  const fetchReviews = useAppStore((s) => s.fetchReviews);
  const updateReviewStep = useAppStore((s) => s.updateReviewStep);
  const publishAsset = useAppStore((s) => s.publishAsset);

  useEffect(() => {
    if (autoFetch) {
      fetchReviews();
    }
  }, [autoFetch]);

  return { reviews, loading, fetchReviews, updateReviewStep, publishAsset };
}

export default useActivities;
