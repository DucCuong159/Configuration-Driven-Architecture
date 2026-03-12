/**
 * AssetUrlWidget - Custom RJSF Widget
 * URL input field with an "Internal Hosting" checkbox beside it.
 */
import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CloudIcon from '@mui/icons-material/Cloud';
import DnsIcon from '@mui/icons-material/Dns';

const AssetUrlWidget: React.FC<WidgetProps> = (props) => {
  const { value, onChange, label, required, disabled, readonly, placeholder, options } = props;

  const showInternalCheckbox = (options as Record<string, unknown>)?.showInternalCheckbox !== false;

  // Value is an object { url: string, isInternal: boolean }
  const currentValue = (typeof value === 'object' && value !== null)
    ? (value as { url: string; isInternal: boolean })
    : { url: (typeof value === 'string' ? value : ''), isInternal: false };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...currentValue, url: e.target.value });
  };

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...currentValue, isInternal: e.target.checked });
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
        {label}
        {required && <span style={{ color: '#f44336' }}> *</span>}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          value={currentValue.url}
          onChange={handleUrlChange}
          placeholder={placeholder || 'https://...'}
          disabled={disabled || readonly}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currentValue.isInternal ? (
                  <DnsIcon fontSize="small" color="primary" />
                ) : (
                  <CloudIcon fontSize="small" color="action" />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />

        {showInternalCheckbox && (
          <FormControlLabel
            control={
              <Checkbox
                checked={currentValue.isInternal}
                onChange={handleInternalChange}
                disabled={disabled || readonly}
                size="small"
                color="primary"
              />
            }
            label={
              <Typography variant="body2" noWrap>
                Internal
              </Typography>
            }
            sx={{
              mt: 0.5,
              minWidth: 100,
              border: '1px solid',
              borderColor: currentValue.isInternal ? 'primary.main' : 'divider',
              borderRadius: 1,
              px: 1,
              backgroundColor: currentValue.isInternal ? 'primary.main' : 'transparent',
              color: currentValue.isInternal ? 'primary.contrastText' : 'text.primary',
              transition: 'all 0.2s ease',
              '& .MuiCheckbox-root': {
                color: currentValue.isInternal ? 'primary.contrastText' : undefined,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AssetUrlWidget;
