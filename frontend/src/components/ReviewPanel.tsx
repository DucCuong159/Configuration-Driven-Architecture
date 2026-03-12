/**
 * ReviewPanel - Reusable component for review detail display.
 * Shows review steps, allows approve/reject with feedback.
 * Can be used as a panel within a page or inside a dialog.
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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

interface ReviewPanelProps {
  /** The review to display */
  review: Review & { activity?: { formData?: Record<string, unknown>; assetId?: string } | null };
  /** Handler for approve/reject actions */
  onReviewAction: (
    reviewId: string,
    stepNumber: number,
    data: { status: 'approved' | 'rejected'; feedback?: string }
  ) => Promise<void>;
  /** Handler for publishing after all steps approved */
  onPublish?: (assetId: string) => Promise<void>;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ review, onReviewAction, onPublish }) => {
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    stepNumber: number;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleAction = (stepNumber: number, action: 'approved' | 'rejected') => {
    setFeedbackDialog({ open: true, stepNumber, action });
    setFeedback('');
  };

  const handleSubmit = async () => {
    if (!feedbackDialog) return;
    await onReviewAction(review.id, feedbackDialog.stepNumber, {
      status: feedbackDialog.action,
      feedback,
    });
    setFeedbackDialog(null);
    setFeedback('');
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {(review.activity?.formData?.name as string) || 'Review Details'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {review.assetType} • Created {new Date(review.createdAt).toLocaleDateString()}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Review Steps */}
      <Stepper activeStep={review.currentStep - 1} orientation="vertical">
        {review.steps.map((step: ReviewStep) => (
          <Step key={step.stepNumber} completed={step.status === 'approved'}>
            <StepLabel icon={getStepIcon(step.status)} error={step.status === 'rejected'}>
              <Typography variant="subtitle2">{step.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                Reviewer: {step.reviewer}
              </Typography>
            </StepLabel>
            <StepContent>
              {/* Feedback */}
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

              {/* Action buttons */}
              {step.status === 'in_progress' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAction(step.stepNumber, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => handleAction(step.stepNumber, 'rejected')}
                  >
                    Reject
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Publish button */}
      {review.overallStatus === 'approved' && review.activity?.assetId && onPublish && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All review steps have been approved!
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => onPublish(review.activity!.assetId!)}
            sx={{ px: 4 }}
          >
            Publish to Asset Library
          </Button>
        </Box>
      )}

      {/* Submitted Data Preview */}
      {review.activity?.formData && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Submitted Data</Typography>
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
              {JSON.stringify(review.activity.formData, null, 2)}
            </pre>
          </Box>
        </Box>
      )}

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
            onClick={handleSubmit}
          >
            {feedbackDialog?.action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewPanel;
