import React from 'react';
import {
  Box,
  Typography,
  Button,
  Pagination,
} from '@mui/material';
import {
  Add,
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No decks found matching your search' : 'No decks found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first deck to get started!'
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateDeck}
            >
              Create Your First Deck
            </Button>
          )}
        </Box>
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
            xl: 'repeat(auto-fill, minmax(300px, 1fr))',
          },
          gap: { xs: 2, sm: 3 },
          mb: 4,
        }}
      >
        {filteredDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onView={onViewDeck}
            onEdit={onEditDeck}
            onDelete={onDeleteDeck}
          />
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