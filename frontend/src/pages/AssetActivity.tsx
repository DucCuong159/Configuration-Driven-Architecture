/**
 * Asset Activity Page
 * Step 1: Choose asset type → Step 2: Choose activity type → Step 3: Fill form → Step 4: Submit
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  alpha,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';

import type { AssetTypeConfig, AssetTypeName, ActivityType } from '../types';
import { getAllConfigs } from '../config/assetTypes';
import AssetForm from '../components/AssetForm';
import { useAppStore } from '../stores/assetStore';

const ASSET_ICONS: Record<string, React.ReactNode> = {
  model: <SmartToyIcon sx={{ fontSize: 32 }} />,
  dataset: <StorageIcon sx={{ fontSize: 32 }} />,
};

const STEPS = ['Select Asset Type', 'Choose Activity', 'Fill Information', 'Submit for Review'];

const AssetActivity: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetTypeName | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);

  const { createActivity, submitActivity, createReview, fetchActivities, activities } = useAppStore();

  useEffect(() => {
    fetchActivities();
  }, []);

  const configs = useMemo(() => getAllConfigs(), []);
  const selectedConfig = useMemo(
    () => configs.find((c) => c.type === selectedAssetType) || null,
    [configs, selectedAssetType]
  );

  // Step 1: Select Asset Type
  const handleAssetTypeSelect = (type: AssetTypeName) => {
    setSelectedAssetType(type);
    setActiveStep(1);
  };

  // Step 2: Select Activity Type
  const handleActivitySelect = (type: ActivityType) => {
    setSelectedActivity(type);
    setActiveStep(2);
  };

  // Step 3: Form Submit
  const handleFormSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (!selectedAssetType || !selectedActivity) return;

      try {
        // Create activity with form data
        const activity = await createActivity({
          assetType: selectedAssetType,
          activityType: selectedActivity,
          formData,
        });
        setCurrentActivityId(activity.id);

        // Submit activity (creates asset + triggers review)
        await submitActivity(activity.id);

        // Create review based on config review steps
        if (selectedConfig?.reviewSteps) {
          await createReview({
            activityId: activity.id,
            assetType: selectedAssetType,
            steps: selectedConfig.reviewSteps.map((s) => ({
              title: s.title,
              reviewerRole: s.reviewerRole,
            })),
          });
        }

        setActiveStep(3);
      } catch (error) {
        console.error('Submit failed:', error);
      }
    },
    [selectedAssetType, selectedActivity, selectedConfig, createActivity, submitActivity, createReview]
  );

  // Go back
  const handleBack = () => {
    if (activeStep === 1) {
      setSelectedAssetType(null);
    } else if (activeStep === 2) {
      setSelectedActivity(null);
    }
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  // Reset
  const handleReset = () => {
    setActiveStep(0);
    setSelectedAssetType(null);
    setSelectedActivity(null);
    setCurrentActivityId(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Asset Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new asset registration, sharing, or other activity
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4, background: alpha('#1e293b', 0.5) }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Back Button */}
      {activeStep > 0 && activeStep < 3 && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
          size="small"
        >
          Back
        </Button>
      )}

      {/* Step 0: Select Asset Type */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          {configs.map((config) => (
            <Grid item xs={12} sm={6} md={4} key={config.type}>
              <Card>
                <CardActionArea
                  onClick={() => handleAssetTypeSelect(config.type)}
                  sx={{ p: 1 }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background:
                          config.type === 'model'
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: '#fff',
                      }}
                    >
                      {ASSET_ICONS[config.type] || <SmartToyIcon sx={{ fontSize: 32 }} />}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {config.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {config.description}
                    </Typography>
                    <Chip
                      label={`${config.fields.length} fields`}
                      size="small"
                      variant="outlined"
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Step 1: Select Activity Type */}
      {activeStep === 1 && selectedConfig && (
        <Grid container spacing={2}>
          {selectedConfig.activities.map((activity) => (
            <Grid item xs={12} sm={6} md={4} key={activity.type}>
              <Card>
                <CardActionArea
                  onClick={() => handleActivitySelect(activity.type)}
                  sx={{ p: 1 }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      {activity.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {activity.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {activity.requiredFields.map((f) => (
                        <Chip
                          key={f}
                          label={f.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Step 2: Fill Form */}
      {activeStep === 2 && selectedConfig && selectedActivity && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              {selectedConfig.label} —{' '}
              {selectedConfig.activities.find((a) => a.type === selectedActivity)?.label}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <AssetForm
            config={selectedConfig}
            activityType={selectedActivity}
            onSubmit={handleFormSubmit}
            submitLabel="Submit for Review"
          />
        </Paper>
      )}

      {/* Step 3: Success */}
      {activeStep === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ color: '#fff' }}>
              ✓
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Activity Submitted Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your {selectedConfig?.label} registration has been submitted for review.
            <br />
            The review team will evaluate your submission.
          </Typography>
          <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            A Model Card Review has been created with {selectedConfig?.reviewSteps.length} review steps.
            Track progress in the <strong>Asset Review</strong> section.
          </Alert>
          <Button variant="contained" onClick={handleReset}>
            Create Another Activity
          </Button>
        </Paper>
      )}

      {/* Existing Activities */}
      {activeStep === 0 && activities.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Activities
          </Typography>
          <Grid container spacing={2}>
            {activities.slice(0, 4).map((act) => (
              <Grid item xs={12} sm={6} key={act.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={act.assetType} size="small" color="primary" variant="outlined" />
                      <Chip
                        label={act.status}
                        size="small"
                        color={
                          act.status === 'completed'
                            ? 'success'
                            : act.status === 'in_review'
                            ? 'warning'
                            : 'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="subtitle2">
                      {act.activityType.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(act.formData?.name as string) || 'Untitled'} •{' '}
                      {new Date(act.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AssetActivity;
