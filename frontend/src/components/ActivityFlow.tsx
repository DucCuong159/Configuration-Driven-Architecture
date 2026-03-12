/**
 * ActivityFlow - Reusable component for the activity creation workflow.
 * Encapsulates the step-based flow: Select Asset Type → Choose Activity → Fill Form → Success.
 * Can be used standalone or embedded in a page.
 */
import React, { useState, useMemo, useCallback } from 'react';
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
  Paper,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';

import type { AssetTypeConfig, AssetTypeName, ActivityType } from '../types';
import AssetForm from './AssetForm';

const ASSET_ICONS: Record<string, React.ReactNode> = {
  model: <SmartToyIcon sx={{ fontSize: 32 }} />,
  dataset: <StorageIcon sx={{ fontSize: 32 }} />,
};

const ICON_GRADIENTS: Record<string, string> = {
  model: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  dataset: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
};

const STEPS = ['Select Asset Type', 'Choose Activity', 'Fill Information', 'Submitted'];

interface ActivityFlowProps {
  /** All available asset type configs */
  configs: AssetTypeConfig[];
  /** Called when form is submitted */
  onSubmit: (params: {
    assetType: AssetTypeName;
    activityType: ActivityType;
    formData: Record<string, unknown>;
  }) => Promise<void>;
  /** Called when draft is saved */
  onSaveDraft?: (params: {
    assetType: AssetTypeName;
    activityType: ActivityType;
    formData: Record<string, unknown>;
  }) => void;
  /** Custom success message */
  successMessage?: string;
}

const ActivityFlow: React.FC<ActivityFlowProps> = ({
  configs,
  onSubmit,
  onSaveDraft,
  successMessage,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetTypeName | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const selectedConfig = useMemo(
    () => configs.find((c) => c.type === selectedAssetType) || null,
    [configs, selectedAssetType]
  );

  const handleAssetTypeSelect = (type: AssetTypeName) => {
    setSelectedAssetType(type);
    setActiveStep(1);
  };

  const handleActivitySelect = (type: ActivityType) => {
    setSelectedActivity(type);
    setActiveStep(2);
  };

  const handleFormSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (!selectedAssetType || !selectedActivity) return;
      await onSubmit({ assetType: selectedAssetType, activityType: selectedActivity, formData });
      setActiveStep(3);
    },
    [selectedAssetType, selectedActivity, onSubmit]
  );

  const handleSaveDraft = useCallback(
    (formData: Record<string, unknown>) => {
      if (!selectedAssetType || !selectedActivity || !onSaveDraft) return;
      onSaveDraft({ assetType: selectedAssetType, activityType: selectedActivity, formData });
    },
    [selectedAssetType, selectedActivity, onSaveDraft]
  );

  const handleBack = () => {
    if (activeStep === 1) setSelectedAssetType(null);
    if (activeStep === 2) setSelectedActivity(null);
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedAssetType(null);
    setSelectedActivity(null);
  };

  return (
    <Box>
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
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }} size="small">
          Back
        </Button>
      )}

      {/* Step 0: Asset Type Selection */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          {configs.map((config) => (
            <Grid item xs={12} sm={6} md={4} key={config.type}>
              <Card>
                <CardActionArea onClick={() => handleAssetTypeSelect(config.type)} sx={{ p: 1 }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: ICON_GRADIENTS[config.type] || ICON_GRADIENTS.model,
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
                    <Chip label={`${config.fields.length} fields`} size="small" variant="outlined" />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Step 1: Activity Type Selection */}
      {activeStep === 1 && selectedConfig && (
        <Grid container spacing={2}>
          {selectedConfig.activities.map((activity) => (
            <Grid item xs={12} sm={6} md={4} key={activity.type}>
              <Card>
                <CardActionArea onClick={() => handleActivitySelect(activity.type)} sx={{ p: 1 }}>
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

      {/* Step 2: Form */}
      {activeStep === 2 && selectedConfig && selectedActivity && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
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
            onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
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
            <Typography variant="h4" sx={{ color: '#fff' }}>✓</Typography>
          </Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Activity Submitted Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {successMessage ||
              `Your ${selectedConfig?.label} activity has been submitted for review.`}
          </Typography>
          {selectedConfig?.reviewSteps && (
            <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              A review has been created with {selectedConfig.reviewSteps.length} steps.
            </Alert>
          )}
          <Button variant="contained" onClick={handleReset}>
            Create Another Activity
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default ActivityFlow;
