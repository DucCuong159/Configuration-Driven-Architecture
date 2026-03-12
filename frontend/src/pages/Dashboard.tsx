/**
 * Dashboard Page - Overview of asset management system
 */
import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  alpha,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PublishIcon from '@mui/icons-material/Publish';
import { useAppStore } from '../stores/assetStore';

const Dashboard: React.FC = () => {
  const { assets, activities, reviews, fetchAssets, fetchActivities, fetchReviews, assetsLoading } =
    useAppStore();

  useEffect(() => {
    fetchAssets();
    fetchActivities();
    fetchReviews();
  }, []);

  const modelCount = assets.filter((a) => a.type === 'model').length;
  const datasetCount = assets.filter((a) => a.type === 'dataset').length;
  const publishedCount = assets.filter((a) => a.status === 'published').length;
  const pendingCount = assets.filter((a) => a.status === 'pending_review').length;
  const activeReviews = reviews.filter((r) => r.overallStatus === 'in_progress').length;

  const statCards = [
    {
      title: 'Total Models',
      value: modelCount,
      icon: <SmartToyIcon />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      title: 'Total Datasets',
      value: datasetCount,
      icon: <StorageIcon />,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
    },
    {
      title: 'Published',
      value: publishedCount,
      icon: <PublishIcon />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: <PendingIcon />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      title: 'Active Reviews',
      value: activeReviews,
      icon: <RateReviewIcon />,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    },
    {
      title: 'Activities',
      value: activities.length,
      icon: <AssignmentIcon />,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of the CDA Asset Management System
        </Typography>
      </Box>

      {assetsLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={stat.title}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                '&:hover .stat-icon': { transform: 'scale(1.1) rotate(5deg)' },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  className="stat-icon"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    transition: 'transform 0.3s ease',
                    '& svg': { color: '#fff', fontSize: 22 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Assets */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Assets
      </Typography>
      <Grid container spacing={2}>
        {assets.slice(0, 6).map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <Card sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={asset.type}
                    size="small"
                    sx={{
                      background:
                        asset.type === 'model'
                          ? alpha('#6366f1', 0.15)
                          : alpha('#06b6d4', 0.15),
                      color: asset.type === 'model' ? '#818cf8' : '#22d3ee',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={asset.status}
                    size="small"
                    variant="outlined"
                    color={
                      asset.status === 'published'
                        ? 'success'
                        : asset.status === 'pending_review'
                        ? 'warning'
                        : 'default'
                    }
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {asset.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  v{asset.version} • {new Date(asset.updatedAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
