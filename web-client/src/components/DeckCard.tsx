import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Style,
} from '@mui/icons-material';
import type { Deck } from '../types/api';

interface DeckCardProps {
  deck: Deck;
  onView?: (deck: Deck) => void;
  onEdit?: (deck: Deck) => void;
  onDelete?: (deck: Deck) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onView,
  onEdit,
  onDelete,
}) => {
  const hexColor = deck.hexColor || '#1976d2';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Color header */}
      <Box
        sx={{
          height: 8,
          backgroundColor: hexColor,
        }}
      />

      {/* Cover image */}
      {deck.coverImageUrl && (
        <Box
          sx={{
            height: 120,
            backgroundImage: `url(${deck.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {deck.name}
        </Typography>
        
        {deck.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {deck.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip
            size="small"
            label={`${deck.cardsCount} cards`}
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<Style />}
            label={hexColor}
            sx={{
              backgroundColor: hexColor,
              color: getContrastColor(hexColor),
              '& .MuiChip-icon': {
                color: getContrastColor(hexColor),
              },
            }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Created: {new Date(deck.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ 
        justifyContent: 'space-between', 
        px: 2, 
        pb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 },
      }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onView?.(deck)}
          fullWidth={false}
          sx={{ 
            order: { xs: 2, sm: 1 },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          View Cards
        </Button>
        
        <Box sx={{ 
          order: { xs: 1, sm: 2 },
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' },
        }}>
          <Tooltip title="Edit deck">
            <IconButton
              size="small"
              onClick={() => onEdit?.(deck)}
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete deck">
            <IconButton
              size="small"
              onClick={() => onDelete?.(deck)}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default DeckCard;