import React from 'react';
import {
  Box,
  Typography,
  Button,
  Pagination,
  Paper,
  alpha,
  Fade,
} from '@mui/material';
import {
  Add,
  School,
  EmojiObjects,
} from '@mui/icons-material';
import type { Deck, Page } from '../types/api';
import DeckCard from './DeckCard';

interface DecksGridProps {
  decks: Page<Deck> | null;
  filteredDecks: Deck[];
  searchQuery: string;
  currentPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onViewDeck: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deck: Deck) => void;
  onCreateDeck: () => void;
}

const DecksGrid: React.FC<DecksGridProps> = ({
  decks,
  filteredDecks,
  searchQuery,
  currentPage,
  onPageChange,
  onViewDeck,
  onEditDeck,
  onDeleteDeck,
  onCreateDeck,
}) => {
  // Stats
  const statsComponent = decks && (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Showing {filteredDecks.length} of {decks.totalElements} decks
    </Typography>
  );

  // Empty state
  if (filteredDecks.length === 0) {
    return (
      <Box>
        {statsComponent}
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#1976d2', 0.03)}, ${alpha('#42a5f5', 0.06)})`,
            border: `1px solid ${alpha('#1976d2', 0.1)}`,
          }}
        >
          <Fade in timeout={600}>
            <Box>
              {searchQuery ? (
                <School 
                  sx={{ 
                    fontSize: 80, 
                    color: 'text.disabled',
                    mb: 2,
                  }} 
                />
              ) : (
                <EmojiObjects 
                  sx={{ 
                    fontSize: 80, 
                    color: 'warning.main',
                    mb: 2,
                    filter: 'drop-shadow(0 2px 8px rgba(255, 193, 7, 0.3))',
                  }} 
                />
              )}
              
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {searchQuery ? 'No decks found' : 'Ready to start learning?'}
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                {searchQuery 
                  ? 'Try adjusting your search terms to find the perfect deck'
                  : 'Create your first study deck and embark on your learning journey!'
                }
              </Typography>
              
              {!searchQuery && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={onCreateDeck}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Create Your First Deck
                </Button>
              )}
            </Box>
          </Fade>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {statsComponent}
      
      {/* Decks Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
          mb: 4,
        }}
      >
        {filteredDecks.map((deck, index) => (
          <Fade 
            key={deck.id}
            in 
            timeout={600} 
            style={{ 
              transitionDelay: `${index * 100}ms` 
            }}
          >
            <Box>
              <DeckCard
                deck={deck}
                onView={onViewDeck}
                onEdit={onEditDeck}
                onDelete={onDeleteDeck}
              />
            </Box>
          </Fade>
        ))}
      </Box>

      {/* Pagination */}
      {decks && decks.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={decks.totalPages}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default DecksGrid;