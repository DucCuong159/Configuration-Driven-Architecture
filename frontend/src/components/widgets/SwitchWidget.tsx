/**
 * SwitchWidget - Custom RJSF Widget
 * Material-UI Switch toggle for boolean fields.
 */
import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { FormControlLabel, Switch, Box, Typography } from '@mui/material';

const SwitchWidget: React.FC<WidgetProps> = (props) => {
  const { value, onChange, label, required, disabled, readonly, schema } = props;

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled || readonly}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            {label || schema.title}
            {required && <span style={{ color: '#f44336' }}> *</span>}
          </Typography>
        }
      />
    </Box>
  );
};

export default SwitchWidget;
