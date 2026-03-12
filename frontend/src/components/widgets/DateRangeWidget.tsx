/**
 * DateRangeWidget - Custom RJSF Widget
 * Two date inputs for start and end date selection.
 */
import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { TextField, Box, Typography } from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';

const DateRangeWidget: React.FC<WidgetProps> = (props) => {
  const { value, onChange, label, required, disabled, readonly } = props;

  const currentValue = (typeof value === 'object' && value !== null)
    ? (value as { startDate: string; endDate: string })
    : { startDate: '', endDate: '' };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...currentValue, startDate: e.target.value });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...currentValue, endDate: e.target.value });
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        <DateRangeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
        {label}
        {required && <span style={{ color: '#f44336' }}> *</span>}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="date"
          size="small"
          label="Start Date"
          value={currentValue.startDate}
          onChange={handleStartChange}
          disabled={disabled || readonly}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          to
        </Typography>
        <TextField
          type="date"
          size="small"
          label="End Date"
          value={currentValue.endDate}
          onChange={handleEndChange}
          disabled={disabled || readonly}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: currentValue.startDate || undefined,
          }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
};

export default DateRangeWidget;
