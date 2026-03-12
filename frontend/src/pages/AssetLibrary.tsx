/**
 * Asset Library Page
 * Browse published assets with filtering, search, and details view.
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  LinearProgress,
  alpha,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { useAppStore } from '../stores/assetStore';
import type { Asset } from '../types';

const ASSET_TYPE_ICONS: Record<string, React.ReactNode> = {
  model: <SmartToyIcon />,
  dataset: <StorageIcon />,
};

const AssetLibrary: React.FC = () => {
  const { assets, assetsLoading, fetchAssets } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets({ status: 'published' as const });
  }, []);

  // Also show all assets for demo (including non-published)
  useEffect(() => {
    fetchAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    let result = assets.filter((a) => a.status === 'published');

    if (activeTab !== 'all') {
      result = result.filter((a) => a.type === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          (a.data?.description as string)?.toLowerCase()?.includes(q)
      );
    }

    return result;
  }, [assets, activeTab, search]);

  const assetTypeCounts = useMemo(() => {
    const published = assets.filter((a) => a.status === 'published');
    return {
      all: published.length,
      model: published.filter((a) => a.type === 'model').length,
      dataset: published.filter((a) => a.type === 'dataset').length,
    };
  }, [assets]);

  const renderFieldValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Asset Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse published assets available for use across the organization
        </Typography>
      </Box>

      {/* Search & Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': { minHeight: 40, textTransform: 'none' },
          }}
        >
          <Tab value="all" label={`All (${assetTypeCounts.all})`} />
          <Tab
            value="model"
            label={`Models (${assetTypeCounts.model})`}
            icon={<SmartToyIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
          <Tab
            value="dataset"
            label={`Datasets (${assetTypeCounts.dataset})`}
            icon={<StorageIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {assetsLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Asset Grid */}
      <Grid container spacing={3}>
        {filteredAssets.length === 0 && !assetsLoading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {search
                  ? `No assets found matching "${search}"`
                  : 'No published assets yet. Register and review assets to publish them here.'}
              </Typography>
            </Paper>
          </Grid>
        )}

        {filteredAssets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedAsset(asset)}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        background:
                          asset.type === 'model'
                            ? alpha('#6366f1', 0.15)
                            : alpha('#06b6d4', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: asset.type === 'model' ? '#818cf8' : '#22d3ee',
                        '& svg': { fontSize: 18 },
                      }}
                    >
                      {ASSET_TYPE_ICONS[asset.type]}
                    </Box>
                    <Chip label={asset.type} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    v{asset.version}
                  </Typography>
                </Box>

                {/* Name & Description */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {asset.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {(asset.data?.description as string) || 'No description'}
                </Typography>

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                  {asset.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        background: alpha('#94a3b8', 0.08),
                      }}
                    />
                  ))}
                  {asset.tags.length > 3 && (
                    <Chip
                      label={`+${asset.tags.length - 3}`}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 22 }}
                    />
                  )}
                </Box>

                {/* Meta */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(asset.updatedAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {asset.data?.is_public ? (
                      <PublicIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    ) : (
                      <LockIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Asset Detail Dialog */}
      <Dialog
        open={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAsset && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{selectedAsset.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedAsset.type} • v{selectedAsset.version}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedAsset(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {(selectedAsset.data?.description as string) || 'No description'}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Asset Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {Object.entries(selectedAsset.data || {})
                      .filter(([key]) => key !== 'description')
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              width: 200,
                              color: 'text.secondary',
                              textTransform: 'capitalize',
                            }}
                          >
                            {key.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            {typeof value === 'object' && value !== null ? (
                              <Box component="pre" sx={{ m: 0, fontSize: '0.8rem' }}>
                                {JSON.stringify(value, null, 2)}
                              </Box>
                            ) : (
                              renderFieldValue(key, value)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Tags */}
              {selectedAsset.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedAsset.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAsset(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AssetLibrary;
