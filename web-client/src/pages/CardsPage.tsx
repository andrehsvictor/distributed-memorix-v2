import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card as MuiCard,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Style,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { deckService, cardService } from '../services/api';
import type { Deck, Card, PostCardDto, PutCardDto, Page } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { useErrorHandler } from '../hooks/useErrorHandler';

const CardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { handleError } = useErrorHandler({
    onRetryableError: () => {
      // Automatically retry loading data after a short delay for 503 errors
      setTimeout(() => loadDeckAndCards(), 3000);
    }
  });
  
  // State
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Page<Card> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Form state for new card
  const [newCard, setNewCard] = useState<PostCardDto>({
    question: '',
    answer: '',
  });

  // Form state for editing card
  const [editCard, setEditCard] = useState<PutCardDto>({
    question: '',
    answer: '',
  });

  // Load deck and cards
  const loadDeckAndCards = async () => {
    if (!deckId) {
      setError('Deck ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load deck info and cards in parallel
      const [deckData, cardsData] = await Promise.all([
        deckService.getById(deckId),
        cardService.getByDeckId(deckId, 0, 20)
      ]);
      
      setDeck(deckData);
      setCards(cardsData);
    } catch (err) {
      console.error('Error loading deck and cards:', err);
      handleError(err, 'load deck and cards');
      setError('Failed to load deck and cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeckAndCards();
  }, [deckId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle card creation
  const handleCreateCard = async () => {
    if (!deckId) return;
    
    try {
      await cardService.create(deckId, newCard);
      setCreateDialogOpen(false);
      setNewCard({
        question: '',
        answer: '',
      });
      setSnackbar({
        open: true,
        message: 'Card created successfully!',
        severity: 'success',
      });
      loadDeckAndCards(); // Reload data
    } catch (err) {
      console.error('Error creating card:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create card. Please try again.',
        severity: 'error',
      });
    }
  };

  // Handle card editing
  const handleEditCard = async () => {
    if (!selectedCard) return;
    
    try {
      await cardService.update(selectedCard.id, editCard);
      setEditDialogOpen(false);
      setSelectedCard(null);
      setEditCard({
        question: '',
        answer: '',
      });
      setSnackbar({
        open: true,
        message: 'Card updated successfully!',
        severity: 'success',
      });
      loadDeckAndCards(); // Reload data
    } catch (err) {
      console.error('Error updating card:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update card. Please try again.',
        severity: 'error',
      });
    }
  };

  // Handle card deletion
  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    
    try {
      await cardService.delete(selectedCard.id);
      setDeleteDialogOpen(false);
      setSelectedCard(null);
      setSnackbar({
        open: true,
        message: 'Card deleted successfully!',
        severity: 'success',
      });
      loadDeckAndCards(); // Reload data
    } catch (err) {
      console.error('Error deleting card:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete card. Please try again.',
        severity: 'error',
      });
    }
  };

  // Open edit dialog with card data
  const openEditDialog = (card: Card) => {
    setSelectedCard(card);
    setEditCard({
      question: card.question,
      answer: card.answer,
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading cards..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadDeckAndCards} />;
  }

  if (!deck) {
    return <ErrorDisplay message="Deck not found" onRetry={loadDeckAndCards} />;
  }

  const hexColor = deck.hexColor || '#1976d2';

  return (
    <Box>
      {/* Header with deck info */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/decks')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {deck.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Add Card
          </Button>
        </Box>

        {/* Deck info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            size="small"
            label={`${cards?.totalElements || 0} cards`}
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

        {deck.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {deck.description}
          </Typography>
        )}

        {/* Color divider */}
        <Divider sx={{ borderColor: hexColor, borderWidth: 2 }} />
      </Box>

      {/* Cards Grid */}
      {cards && cards.content.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            mb: 4,
          }}
        >
          {cards.content.map((card) => (
            <MuiCard
              key={card.id}
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
                  height: 4,
                  backgroundColor: hexColor,
                }}
              />

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {card.question}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {card.answer}
                </Typography>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 1, 
                  mt: 2 
                }}>
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(card)}
                    color="primary"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedCard(card);
                      setDeleteDialogOpen(true);
                    }}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </MuiCard>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No cards found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first card to start studying!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Your First Card
          </Button>
        </Box>
      )}

      {/* Floating Action Button - apenas em mobile */}
      <Fab
        color="primary"
        aria-label="add card"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Card Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '90vh', sm: 'none' },
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Add New Card</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newCard.question}
            onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Answer"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newCard.answer}
            onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCard}
            variant="contained"
            disabled={!newCard.question.trim() || !newCard.answer.trim()}
          >
            Add Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '90vh', sm: 'none' },
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Edit Card</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editCard.question}
            onChange={(e) => setEditCard({ ...editCard, question: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Answer"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editCard.answer}
            onChange={(e) => setEditCard({ ...editCard, answer: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditCard}
            variant="contained"
            disabled={!editCard.question.trim() || !editCard.answer.trim()}
          >
            Update Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Card</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this card? This action cannot be undone.
          </Typography>
          {selectedCard && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Question: {selectedCard.question}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Answer: {selectedCard.answer}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCard} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
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

export default CardsPage;