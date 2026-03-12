/**
 * Asset Review Page
 * Multi-step model card review with admin approve/reject flow.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import { useAppStore } from '../stores/assetStore';
import type { Review, ReviewStep } from '../types';

const getStepIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon sx={{ color: '#10b981' }} />;
    case 'rejected':
      return <CancelIcon sx={{ color: '#ef4444' }} />;
    case 'in_progress':
      return <PlayArrowIcon sx={{ color: '#6366f1' }} />;
    default:
      return <PendingIcon sx={{ color: '#94a3b8' }} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'in_progress': return 'primary';
    default: return 'default';
  }
};

const AssetReview: React.FC = () => {
  const { reviews, reviewsLoading, fetchReviews, updateReviewStep, publishAsset } = useAppStore();
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    reviewId: string;
    stepNumber: number;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const activeReview = reviews.find((r) => r.id === selectedReview);

  const handleReviewAction = (reviewId: string, stepNumber: number, action: 'approved' | 'rejected') => {
    setFeedbackDialog({ open: true, reviewId, stepNumber, action });
    setFeedback('');
  };

  const handleSubmitReview = async () => {
    if (!feedbackDialog) return;
    await updateReviewStep(feedbackDialog.reviewId, feedbackDialog.stepNumber, {
      status: feedbackDialog.action,
      feedback,
    });
    setFeedbackDialog(null);
    setFeedback('');
    fetchReviews();
  };

  const handlePublish = async (assetId: string) => {
    await publishAsset(assetId);
    fetchReviews();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Asset Review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve asset registrations through multi-step verification
        </Typography>
      </Box>

      {reviewsLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      <Grid container spacing={3}>
        {/* Review List */}
        <Grid item xs={12} md={selectedReview ? 5 : 12}>
          <Grid container spacing={2}>
            {reviews.length === 0 && !reviewsLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews pending. Submit an activity to create a review.
                  </Typography>
                </Paper>
              </Grid>
            )}
            {reviews.map((review) => (
              <Grid item xs={12} sm={selectedReview ? 12 : 6} md={selectedReview ? 12 : 4} key={review.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedReview === review.id ? '2px solid' : '1px solid',
                    borderColor:
                      selectedReview === review.id
                        ? 'primary.main'
                        : alpha('#94a3b8', 0.08),
                  }}
                  onClick={() => setSelectedReview(review.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip
                        label={review.assetType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={review.overallStatus.replace(/_/g, ' ')}
                        size="small"
                        color={getStatusColor(review.overallStatus) as 'success' | 'error' | 'primary' | 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {(review.activity?.formData?.name as string) || 'Untitled Review'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Step {review.currentStep} of {review.steps.length} •{' '}
                      {new Date(review.updatedAt).toLocaleDateString()}
                    </Typography>

                    {/* Mini progress */}
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5 }}>
                      {review.steps.map((step) => (
                        <Box
                          key={step.stepNumber}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background:
                              step.status === 'approved'
                                ? '#10b981'
                                : step.status === 'in_progress'
                                ? '#6366f1'
                                : step.status === 'rejected'
                                ? '#ef4444'
                                : alpha('#94a3b8', 0.2),
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Review Detail */}
        {selectedReview && activeReview && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {(activeReview.activity?.formData?.name as string) || 'Review Details'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeReview.assetType} • Created{' '}
                {new Date(activeReview.createdAt).toLocaleDateString()}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Review Steps */}
              <Stepper
                activeStep={activeReview.currentStep - 1}
                orientation="vertical"
              >
                {activeReview.steps.map((step: ReviewStep) => (
                  <Step key={step.stepNumber} completed={step.status === 'approved'}>
                    <StepLabel
                      icon={getStepIcon(step.status)}
                      error={step.status === 'rejected'}
                    >
                      <Typography variant="subtitle2">{step.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reviewer: {step.reviewer}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      {/* Show feedback if exists */}
                      {step.feedback && (
                        <Box
                          sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 1,
                            background: alpha('#94a3b8', 0.05),
                            border: '1px solid',
                            borderColor: alpha('#94a3b8', 0.1),
                          }}
                        >
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{step.feedback}"
                          </Typography>
                          {step.completedAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {new Date(step.completedAt).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Action buttons for current step */}
                      {step.status === 'in_progress' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() =>
                              handleReviewAction(activeReview.id, step.stepNumber, 'approved')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() =>
                              handleReviewAction(activeReview.id, step.stepNumber, 'rejected')
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Publish button when all steps approved */}
              {activeReview.overallStatus === 'approved' && activeReview.activity?.assetId && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    All review steps have been approved!
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => handlePublish(activeReview.activity!.assetId!)}
                    sx={{ px: 4 }}
                  >
                    Publish to Asset Library
                  </Button>
                </Box>
              )}

              {/* Form Data Preview */}
              {activeReview.activity?.formData && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Submitted Data
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: alpha('#000', 0.2),
                      maxHeight: 300,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(activeReview.activity.formData, null, 2)}
                    </pre>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackDialog?.open}
        onClose={() => setFeedbackDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {feedbackDialog?.action === 'approved' ? '✅ Approve Step' : '❌ Reject Step'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add feedback for this review step (optional):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={feedbackDialog?.action === 'approved' ? 'success' : 'error'}
            onClick={handleSubmitReview}
          >
            {feedbackDialog?.action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetReview;
