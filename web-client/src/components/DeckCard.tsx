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
  PlayArrow,
  AutoStories,
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
  const cardCount = deck.cardsCount || 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          '& .deck-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
          '& .deck-cover': {
            transform: 'scale(1.02)',
          },
          '& .play-button': {
            transform: 'scale(1.1)',
            opacity: 1,
          },
        },
      }}
      onClick={(e) => {
        e.preventDefault();
        onView?.(deck);
      }}
    >
      {/* Header with gradient and icon */}
      <Box
        className="deck-cover"
        sx={{
          height: 140,
          background: `linear-gradient(135deg, ${hexColor}e6, ${hexColor}cc, ${hexColor})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2), transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)',
          },
        }}
      >
        {/* Main icon */}
        <AutoStories 
          sx={{ 
            fontSize: 56, 
            color: 'white', 
            opacity: 0.9,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            zIndex: 2,
          }} 
        />
        
        {/* Play button overlay */}
        <Box
          className="play-button"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.8)',
            opacity: 0,
            transition: 'all 0.3s ease',
            zIndex: 3,
          }}
        >
          <PlayArrow 
            sx={{ 
              fontSize: 32, 
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.4)',
              borderRadius: '50%',
              p: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }} 
          />
        </Box>
        
        {/* Card count badge */}
        <Chip
          label={`${cardCount} ${cardCount === 1 ? 'card' : 'cards'}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: hexColor,
            fontWeight: 600,
            fontSize: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 2,
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            lineHeight: 1.3,
            mb: 1,
            color: 'text.primary',
          }}
        >
          {deck.name}
        </Typography>
        
        {deck.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {deck.description}
          </Typography>
        )}

        {/* Deck statistics */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: hexColor,
                boxShadow: `0 0 0 2px ${hexColor}33`,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              General
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions 
        className="deck-actions"
        sx={{ 
          justifyContent: 'space-between',
          px: 3,
          pb: 2,
          opacity: 0.7,
          transform: 'translateY(4px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={(e) => {
            e.stopPropagation();
            onView?.(deck);
          }}
          sx={{
            color: hexColor,
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              bgcolor: `${hexColor}15`,
            },
          }}
        >
          Study
        </Button>
        
        <Box>
          <Tooltip title="Edit deck">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(deck);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'primary.light',
                },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete deck">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(deck);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'error.light',
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default DeckCard;
