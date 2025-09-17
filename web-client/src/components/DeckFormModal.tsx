import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import type { PostDeckDto, PutDeckDto } from '../types/api';

interface DeckFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  deck: PostDeckDto | PutDeckDto;
  onChange: (deck: PostDeckDto | PutDeckDto) => void;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
}

const DeckFormModal: React.FC<DeckFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  deck,
  onChange,
  title,
  submitLabel,
  isSubmitting = false,
}) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...deck, [field]: value } as PostDeckDto | PutDeckDto);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={false}
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '90vh', sm: 'none' },
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Deck Name"
          fullWidth
          variant="outlined"
          value={deck.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          sx={{ mb: 2 }}
          disabled={isSubmitting}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={deck.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          sx={{ mb: 2 }}
          disabled={isSubmitting}
        />
        <TextField
          margin="dense"
          label="Cover Image URL"
          fullWidth
          variant="outlined"
          value={deck.coverImageUrl || ''}
          onChange={(e) => handleChange('coverImageUrl', e.target.value)}
          sx={{ mb: 2 }}
          disabled={isSubmitting}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            margin="dense"
            label="Color"
            type="color"
            variant="outlined"
            value={deck.hexColor || '#1976d2'}
            onChange={(e) => handleChange('hexColor', e.target.value)}
            sx={{ width: { xs: '100%', sm: 120 } }}
            disabled={isSubmitting}
          />
          <Typography variant="body2" color="text.secondary">
            {deck.hexColor || '#1976d2'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!deck.name.trim() || isSubmitting}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeckFormModal;