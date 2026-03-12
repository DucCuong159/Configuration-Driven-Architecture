/**
 * Mock Data for CDA Backend
 * In-memory data store for assets, activities, and reviews.
 */
import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────

export interface Asset {
  id: string;
  type: string;
  name: string;
  data: Record<string, unknown>;
  status: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

export interface Activity {
  id: string;
  assetId: string | null;
  assetType: string;
  activityType: string;
  status: string;
  formData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ReviewStep {
  stepNumber: number;
  title: string;
  status: string;
  reviewer: string;
  feedback: string;
  completedAt: string | null;
}

export interface Review {
  id: string;
  activityId: string;
  assetType: string;
  steps: ReviewStep[];
  currentStep: number;
  overallStatus: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Mock Data ──────────────────────────────────────────

export const assets: Asset[] = [
  {
    id: 'asset-001',
    type: 'model',
    name: 'ResNet-50 Image Classifier',
    data: {
      name: 'ResNet-50 Image Classifier',
      version: '2.1.0',
      description: 'A deep residual network for image classification trained on ImageNet',
      framework: 'pytorch',
      input_type: 'image',
      input_format: 'jpeg',
      model_type: 'classification',
      is_pretrained: true,
      pretrained_source: 'HuggingFace',
      training_datasets: ['ds-001'],
      model_url: { url: 'https://storage.example.com/models/resnet50-v2.1.pt', isInternal: false },
      model_size: 98,
      inference_time: 45,
      accuracy: 94.5,
      tags: ['computer-vision', 'classification', 'imagenet'],
      owner_email: 'ml-team@company.com',
      is_public: true,
      status_tag: 'production',
      created_date: '2024-01-15',
      valid_period: { startDate: '2024-01-15', endDate: '2025-12-31' },
    },
    status: 'published',
    version: '2.1.0',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
    createdBy: 'user-001',
    tags: ['computer-vision', 'classification', 'imagenet'],
  },
  {
    id: 'asset-002',
    type: 'model',
    name: 'BERT Sentiment Analyzer',
    data: {
      name: 'BERT Sentiment Analyzer',
      version: '1.0.0',
      description: 'Fine-tuned BERT model for sentiment analysis on product reviews',
      framework: 'pytorch',
      input_type: 'text',
      input_format: 'plain_text',
      model_type: 'classification',
      is_pretrained: true,
      pretrained_source: 'HuggingFace',
      training_datasets: ['ds-003'],
      model_url: { url: 's3://internal-models/bert-sentiment-v1.bin', isInternal: true },
      model_size: 440,
      inference_time: 120,
      accuracy: 91.2,
      tags: ['nlp', 'sentiment', 'bert'],
      owner_email: 'nlp-team@company.com',
      is_public: false,
      status_tag: 'staging',
    },
    status: 'published',
    version: '1.0.0',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-05-15T09:00:00Z',
    createdBy: 'user-002',
    tags: ['nlp', 'sentiment', 'bert'],
  },
  {
    id: 'asset-003',
    type: 'model',
    name: 'YOLOv8 Object Detector',
    data: {
      name: 'YOLOv8 Object Detector',
      version: '8.0.1',
      description: 'Real-time object detection model for autonomous driving',
      framework: 'pytorch',
      input_type: 'image',
      model_type: 'detection',
      training_datasets: ['ds-002'],
      tags: ['object-detection', 'autonomous-driving'],
      owner_email: 'av-team@company.com',
      status_tag: 'experimental',
    },
    status: 'pending_review',
    version: '8.0.1',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z',
    createdBy: 'user-003',
    tags: ['object-detection', 'autonomous-driving'],
  },
  {
    id: 'ds-001',
    type: 'dataset',
    name: 'ImageNet-2024',
    data: {
      name: 'ImageNet-2024',
      version: '2.1.0',
      description: 'Large-scale image dataset with 14M+ images across 21K categories',
      format: 'image_folder',
      size_mb: 156000,
      row_count: 14197122,
      has_labels: true,
      label_type: 'multiclass',
      source_url: { url: 'https://image-net.org/download', isInternal: false },
      access_level: 'public',
      tags: ['images', 'classification', 'benchmark'],
      owner_email: 'data-team@company.com',
      data_category: 'training',
    },
    status: 'published',
    version: '2.1.0',
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    createdBy: 'user-001',
    tags: ['images', 'classification', 'benchmark'],
  },
  {
    id: 'ds-002',
    type: 'dataset',
    name: 'COCO Detection 2024',
    data: {
      name: 'COCO Detection 2024',
      version: '3.0.0',
      description: 'Object detection and segmentation dataset with 330K images',
      format: 'json',
      size_mb: 25000,
      row_count: 330000,
      has_labels: true,
      label_type: 'bbox',
      source_url: { url: 'https://cocodataset.org', isInternal: false },
      access_level: 'public',
      tags: ['object-detection', 'segmentation', 'coco'],
      owner_email: 'data-team@company.com',
      data_category: 'training',
    },
    status: 'published',
    version: '3.0.0',
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: '2024-02-20T16:00:00Z',
    createdBy: 'user-001',
    tags: ['object-detection', 'segmentation', 'coco'],
  },
  {
    id: 'ds-003',
    type: 'dataset',
    name: 'WikiText-103',
    data: {
      name: 'WikiText-103',
      version: '1.0.0',
      description: 'Large language modeling dataset from verified Wikipedia articles',
      format: 'csv',
      size_mb: 500,
      row_count: 28595,
      has_labels: false,
      source_url: { url: 'https://blog.salesforce.com/wikitext', isInternal: false },
      access_level: 'public',
      tags: ['nlp', 'language-model', 'wikipedia'],
      owner_email: 'nlp-team@company.com',
      data_category: 'training',
    },
    status: 'published',
    version: '1.0.0',
    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2023-04-01T08:00:00Z',
    createdBy: 'user-002',
    tags: ['nlp', 'language-model', 'wikipedia'],
  },
];

export const activities: Activity[] = [
  {
    id: 'act-001',
    assetId: 'asset-003',
    assetType: 'model',
    activityType: 'registration',
    status: 'in_review',
    formData: {
      name: 'YOLOv8 Object Detector',
      version: '8.0.1',
      framework: 'pytorch',
      input_type: 'image',
      model_type: 'detection',
      training_datasets: ['ds-002'],
      owner_email: 'av-team@company.com',
    },
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-02T10:00:00Z',
    createdBy: 'user-003',
  },
  {
    id: 'act-002',
    assetId: null,
    assetType: 'dataset',
    activityType: 'registration',
    status: 'draft',
    formData: {
      name: 'Customer Feedback Q3',
      format: 'csv',
    },
    createdAt: '2024-07-05T14:00:00Z',
    updatedAt: '2024-07-05T14:00:00Z',
    createdBy: 'user-004',
  },
];

export const reviews: Review[] = [
  {
    id: 'rev-001',
    activityId: 'act-001',
    assetType: 'model',
    steps: [
      {
        stepNumber: 1,
        title: 'Basic Information Review',
        status: 'approved',
        reviewer: 'admin',
        feedback: 'Model name and version look good. Description is clear.',
        completedAt: '2024-07-01T15:00:00Z',
      },
      {
        stepNumber: 2,
        title: 'Technical Details Review',
        status: 'in_progress',
        reviewer: 'ml_engineer',
        feedback: '',
        completedAt: null,
      },
      {
        stepNumber: 3,
        title: 'Final Approval',
        status: 'pending',
        reviewer: 'admin',
        feedback: '',
        completedAt: null,
      },
    ],
    currentStep: 2,
    overallStatus: 'in_progress',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-02T10:00:00Z',
  },
];

// ─── Input Format Options (for dynamic field dependency) ─
export const inputFormatOptions: Record<string, Array<{ label: string; value: string }>> = {
  image: [
    { label: 'JPEG', value: 'jpeg' },
    { label: 'PNG', value: 'png' },
    { label: 'TIFF', value: 'tiff' },
    { label: 'BMP', value: 'bmp' },
    { label: 'WebP', value: 'webp' },
    { label: 'DICOM', value: 'dicom' },
  ],
  text: [
    { label: 'Plain Text', value: 'plain_text' },
    { label: 'JSON', value: 'json' },
    { label: 'XML', value: 'xml' },
    { label: 'HTML', value: 'html' },
    { label: 'Markdown', value: 'markdown' },
  ],
  audio: [
    { label: 'WAV', value: 'wav' },
    { label: 'MP3', value: 'mp3' },
    { label: 'FLAC', value: 'flac' },
    { label: 'OGG', value: 'ogg' },
  ],
  video: [
    { label: 'MP4', value: 'mp4' },
    { label: 'AVI', value: 'avi' },
    { label: 'MKV', value: 'mkv' },
    { label: 'MOV', value: 'mov' },
  ],
  tabular: [
    { label: 'CSV', value: 'csv' },
    { label: 'Parquet', value: 'parquet' },
    { label: 'TSV', value: 'tsv' },
    { label: 'Excel', value: 'xlsx' },
  ],
  multimodal: [
    { label: 'Mixed', value: 'mixed' },
    { label: 'Custom', value: 'custom' },
  ],
};

// ─── Helper Functions ───────────────────────────────────

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${uuidv4().slice(0, 8)}`;
}

export function now(): string {
  return new Date().toISOString();
}
