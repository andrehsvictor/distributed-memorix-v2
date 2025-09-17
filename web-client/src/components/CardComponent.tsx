import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Quiz,
} from '@mui/icons-material';
import type { Card as CardType, CardWithDeck } from '../types/api';

interface CardComponentProps {
  card: CardType | CardWithDeck;
  onEdit?: (card: CardType | CardWithDeck) => void;
  onDelete?: (card: CardType | CardWithDeck) => void;
  showDeckInfo?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onEdit,
  onDelete,
  showDeckInfo = false,
}) => {
  const isDeckCard = 'deck' in card;
  const deckInfo = isDeckCard ? card.deck : null;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <Quiz color="primary" sx={{ mt: 0.5 }} />
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            Question
          </Typography>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            backgroundColor: 'grey.50',
            p: 1.5,
            borderRadius: 1,
            borderLeft: '4px solid',
            borderLeftColor: 'primary.main',
          }}
        >
          {card.question}
        </Typography>

        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Answer
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            backgroundColor: 'success.50',
            p: 1.5,
            borderRadius: 1,
            borderLeft: '4px solid',
            borderLeftColor: 'success.main',
          }}
        >
          {card.answer}
        </Typography>

        {showDeckInfo && deckInfo && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Chip
              label={`From: ${deckInfo.name}`}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: deckInfo.hexColor,
                color: getContrastColor(deckInfo.hexColor),
                borderColor: deckInfo.hexColor,
              }}
            />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Created: {new Date(card.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Tooltip title="Edit card">
          <IconButton
            size="small"
            onClick={() => onEdit?.(card)}
            color="primary"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete card">
          <IconButton
            size="small"
            onClick={() => onDelete?.(card)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
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

export default CardComponent;