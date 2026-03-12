/**
 * AssetRelationWidget - Custom RJSF Widget
 * Allows searching and selecting related assets (same or different type).
 * Renders as a searchable autocomplete + table of selected relations.
 */
import React, { useState, useCallback } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import {
  Autocomplete,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';

/** Mock asset data for search - in production this would come from API */
const MOCK_ASSETS = [
  { id: 'ds-001', name: 'ImageNet-2024', type: 'dataset', version: '2.1.0' },
  { id: 'ds-002', name: 'COCO Detection', type: 'dataset', version: '3.0.0' },
  { id: 'ds-003', name: 'WikiText-103', type: 'dataset', version: '1.0.0' },
  { id: 'ds-004', name: 'Common Voice', type: 'dataset', version: '12.0.0' },
  { id: 'ds-005', name: 'LibriSpeech', type: 'dataset', version: '1.0.0' },
  { id: 'md-001', name: 'ResNet-50', type: 'model', version: '1.0.0' },
  { id: 'md-002', name: 'BERT-base', type: 'model', version: '2.0.0' },
  { id: 'md-003', name: 'YOLOv8', type: 'model', version: '8.0.0' },
  { id: 'md-004', name: 'Whisper-large', type: 'model', version: '3.0.0' },
  { id: 'md-005', name: 'GPT-4o-mini', type: 'model', version: '1.0.0' },
];

interface RelatedAsset {
  id: string;
  name: string;
  type: string;
  version: string;
}

const AssetRelationWidget: React.FC<WidgetProps> = (props) => {
  const { value, onChange, label, required, disabled, readonly, options } = props;
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  const relatedAssetType = (options as Record<string, unknown>)?.relatedAssetType as string || 'any';
  const isMultiple = (options as Record<string, unknown>)?.multiple !== false;

  // Parse current value (array of asset IDs)
  const selectedIds: string[] = Array.isArray(value) ? value : value ? [value] : [];

  // Get full asset objects for selected IDs
  const selectedAssets: RelatedAsset[] = selectedIds
    .map((id) => MOCK_ASSETS.find((a) => a.id === id))
    .filter(Boolean) as RelatedAsset[];

  // Filter available assets based on type and search
  const availableAssets = MOCK_ASSETS.filter((asset) => {
    if (relatedAssetType !== 'any' && asset.type !== relatedAssetType) return false;
    if (selectedIds.includes(asset.id)) return false;
    if (searchInput) {
      return asset.name.toLowerCase().includes(searchInput.toLowerCase());
    }
    return true;
  });

  const handleAdd = useCallback(
    (_event: React.SyntheticEvent, newValue: RelatedAsset | null) => {
      if (!newValue) return;
      setLoading(true);
      setTimeout(() => {
        const newIds = isMultiple ? [...selectedIds, newValue.id] : [newValue.id];
        onChange(isMultiple ? newIds : newIds[0]);
        setSearchInput('');
        setLoading(false);
      }, 300);
    },
    [selectedIds, onChange, isMultiple]
  );

  const handleRemove = useCallback(
    (assetId: string) => {
      const newIds = selectedIds.filter((id) => id !== assetId);
      onChange(isMultiple ? newIds : newIds[0] || undefined);
    },
    [selectedIds, onChange, isMultiple]
  );

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
        {label}
        {required && <span style={{ color: '#f44336' }}> *</span>}
      </Typography>

      {/* Search & Add */}
      {!readonly && !disabled && (
        <Autocomplete
          options={availableAssets}
          getOptionLabel={(option) => `${option.name} (v${option.version})`}
          inputValue={searchInput}
          onInputChange={(_e, val) => setSearchInput(val)}
          onChange={handleAdd}
          value={null}
          loading={loading}
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={`Search ${relatedAssetType !== 'any' ? relatedAssetType + 's' : 'assets'}...`}
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(optionProps, option) => (
            <li {...optionProps} key={option.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Chip label={option.type} size="small" color="primary" variant="outlined" />
                <Typography variant="body2">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  v{option.version}
                </Typography>
              </Box>
            </li>
          )}
          sx={{ mb: 2 }}
        />
      )}

      {/* Selected Assets Table */}
      {selectedAssets.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                {!readonly && !disabled && (
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <Chip label={asset.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{asset.version}</TableCell>
                  {!readonly && !disabled && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(asset.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedAssets.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
          No related assets selected
        </Typography>
      )}
    </Box>
  );
};

export default AssetRelationWidget;
