/**
 * Zustand Asset Store - Global state management
 */
import { create } from 'zustand';
import type { Asset, Activity, Review, AssetFilters, AssetTypeName } from '../types';
import * as api from '../api/assets';

interface AppState {
  // Assets
  assets: Asset[];
  assetsLoading: boolean;
  assetsError: string | null;
  selectedAssetId: string | null;
  filters: AssetFilters;

  // Activities
  activities: Activity[];
  activitiesLoading: boolean;

  // Reviews
  reviews: Array<Review & { activity: Activity | null; asset: Asset | null }>;
  reviewsLoading: boolean;

  // Notification
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;

  // Asset Actions
  fetchAssets: (filters?: AssetFilters) => Promise<void>;
  createAsset: (data: { type: AssetTypeName; name: string; data: Record<string, unknown>; tags?: string[] }) => Promise<Asset>;
  publishAsset: (id: string) => Promise<void>;
  selectAsset: (id: string | null) => void;
  setFilters: (filters: AssetFilters) => void;

  // Activity Actions
  fetchActivities: (filters?: Record<string, string>) => Promise<void>;
  createActivity: (data: { assetType: string; activityType: string; formData?: Record<string, unknown> }) => Promise<Activity>;
  submitActivity: (id: string) => Promise<void>;

  // Review Actions
  fetchReviews: (filters?: Record<string, string>) => Promise<void>;
  createReview: (data: { activityId: string; assetType: string; steps: Array<{ title: string; reviewerRole: string }> }) => Promise<Review>;
  updateReviewStep: (reviewId: string, stepNumber: number, data: { status: string; feedback?: string }) => Promise<void>;

  // UI Actions
  setNotification: (notification: AppState['notification']) => void;
  clearNotification: () => void;
  resetError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  assets: [],
  assetsLoading: false,
  assetsError: null,
  selectedAssetId: null,
  filters: {},
  activities: [],
  activitiesLoading: false,
  reviews: [],
  reviewsLoading: false,
  notification: null,

  // ─── Asset Actions ─────────────────────────────────────
  fetchAssets: async (filters) => {
    set({ assetsLoading: true, assetsError: null });
    try {
      const response = await api.fetchAssets(filters || get().filters);
      set({ assets: response.data, assetsLoading: false });
    } catch (error) {
      set({ assetsError: (error as Error).message, assetsLoading: false });
    }
  },

  createAsset: async (data) => {
    set({ assetsLoading: true });
    try {
      const asset = await api.createAsset(data);
      set((state) => ({
        assets: [...state.assets, asset],
        assetsLoading: false,
        notification: { type: 'success', message: `Asset "${asset.name}" created successfully` },
      }));
      return asset;
    } catch (error) {
      set({
        assetsLoading: false,
        notification: { type: 'error', message: (error as Error).message },
      });
      throw error;
    }
  },

  publishAsset: async (id) => {
    try {
      const asset = await api.publishAsset(id);
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? { ...a, ...asset, status: 'published' } : a)),
        notification: { type: 'success', message: `Asset published to library` },
      }));
    } catch (error) {
      set({ notification: { type: 'error', message: (error as Error).message } });
    }
  },

  selectAsset: (id) => set({ selectedAssetId: id }),
  setFilters: (filters) => set({ filters }),

  // ─── Activity Actions ──────────────────────────────────
  fetchActivities: async (filters) => {
    set({ activitiesLoading: true });
    try {
      const activities = await api.fetchActivities(filters);
      set({ activities, activitiesLoading: false });
    } catch (error) {
      set({ activitiesLoading: false, notification: { type: 'error', message: (error as Error).message } });
    }
  },

  createActivity: async (data) => {
    try {
      const activity = await api.createActivity(data);
      set((state) => ({
        activities: [...state.activities, activity],
        notification: { type: 'success', message: 'Activity created' },
      }));
      return activity;
    } catch (error) {
      set({ notification: { type: 'error', message: (error as Error).message } });
      throw error;
    }
  },

  submitActivity: async (id) => {
    try {
      const result = await api.submitActivity(id);
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? result.activity : a)),
        assets: [...state.assets, result.asset],
        notification: { type: 'success', message: 'Activity submitted for review' },
      }));
    } catch (error) {
      set({ notification: { type: 'error', message: (error as Error).message } });
    }
  },

  // ─── Review Actions ────────────────────────────────────
  fetchReviews: async (filters) => {
    set({ reviewsLoading: true });
    try {
      const reviews = await api.fetchReviews(filters);
      set({ reviews, reviewsLoading: false });
    } catch (error) {
      set({ reviewsLoading: false, notification: { type: 'error', message: (error as Error).message } });
    }
  },

  createReview: async (data) => {
    try {
      const review = await api.createReview(data);
      set({ notification: { type: 'success', message: 'Review created' } });
      return review;
    } catch (error) {
      set({ notification: { type: 'error', message: (error as Error).message } });
      throw error;
    }
  },

  updateReviewStep: async (reviewId, stepNumber, data) => {
    try {
      const updatedReview = await api.updateReviewStep(reviewId, stepNumber, data);
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId ? { ...r, ...updatedReview } : r
        ),
        notification: {
          type: 'success',
          message: `Step ${stepNumber} ${data.status}`,
        },
      }));
      // Refresh assets if review completed
      if (data.status === 'approved' || data.status === 'rejected') {
        get().fetchAssets();
      }
    } catch (error) {
      set({ notification: { type: 'error', message: (error as Error).message } });
    }
  },

  // ─── UI Actions ────────────────────────────────────────
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
  resetError: () => set({ assetsError: null }),
}));
