/**
 * TagsWidget - Custom RJSF Widget
 * Chip-based tag input with free-text entry.
 */
import React, { useState } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { TextField, Chip, Box, Typography, Stack } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const TagsWidget: React.FC<WidgetProps> = (props) => {
  const { value, onChange, label, required, disabled, readonly, placeholder } = props;
  const [inputValue, setInputValue] = useState('');

  const tags: string[] = Array.isArray(value) ? value : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        <LocalOfferIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
        {label}
        {required && <span style={{ color: '#f44336' }}> *</span>}
      </Typography>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          minHeight: 42,
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onDelete={!disabled && !readonly ? () => handleRemove(tag) : undefined}
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Stack>

        {!readonly && !disabled && (
          <TextField
            variant="standard"
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? (placeholder || 'Type and press Enter...') : 'Add tag...'}
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, minWidth: 120, ml: 0.5 }}
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Press Enter or comma to add a tag
      </Typography>
    </Box>
  );
};

export default TagsWidget;
