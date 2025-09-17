import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Pagination,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deckService } from '../services/api';
import type { Deck, PostDeckDto, Page } from '../types/api';
import DeckCard from '../components/DeckCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const DecksPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [decks, setDecks] = useState<Page<Deck> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Form state for new deck
  const [newDeck, setNewDeck] = useState<PostDeckDto>({
    name: '',
    description: '',
    coverImageUrl: '',
    hexColor: '#1976d2',
  });

  // Load decks
  const loadDecks = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await deckService.getAll(page - 1, 12); // 0-based pagination
      setDecks(data);
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Failed to load decks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDecks(currentPage);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Handle deck creation
  const handleCreateDeck = async () => {
    try {
      await deckService.create(newDeck);
      setCreateDialogOpen(false);
      setNewDeck({
        name: '',
        description: '',
        coverImageUrl: '',
        hexColor: '#1976d2',
      });
      setSnackbar({
        open: true,
        message: 'Deck created successfully!',
        severity: 'success',
      });
      loadDecks(currentPage); // Reload current page
    } catch (err) {
      console.error('Error creating deck:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create deck. Please try again.',
        severity: 'error',
      });
    }
  };

  // Handle deck deletion
  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    
    try {
      await deckService.delete(selectedDeck.id);
      setDeleteDialogOpen(false);
      setSelectedDeck(null);
      setSnackbar({
        open: true,
        message: 'Deck deleted successfully!',
        severity: 'success',
      });
      loadDecks(currentPage); // Reload current page
    } catch (err) {
      console.error('Error deleting deck:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete deck. Please try again.',
        severity: 'error',
      });
    }
  };

  // Filter decks based on search query
  const filteredDecks = decks?.content.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return <LoadingSpinner message="Loading decks..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => loadDecks(currentPage)} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Decks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          size="large"
        >
          Create Deck
        </Button>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl variant="outlined" sx={{ flexGrow: 1, maxWidth: 400 }}>
          <InputLabel htmlFor="search-decks">Search decks</InputLabel>
          <OutlinedInput
            id="search-decks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            label="Search decks"
          />
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => loadDecks(currentPage)}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats */}
      {decks && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredDecks.length} of {decks.totalElements} decks
        </Typography>
      )}

      {/* Decks Grid */}
      {filteredDecks.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onView={(deck) => navigate(`/decks/${deck.id}/cards`)}
                onEdit={(deck) => navigate(`/decks/${deck.id}/edit`)}
                onDelete={(deck) => {
                  setSelectedDeck(deck);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </Box>

          {/* Pagination */}
          {decks && decks.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={decks.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
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
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Your First Deck
            </Button>
          )}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add deck"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Deck Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Deck</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Deck Name"
            fullWidth
            variant="outlined"
            value={newDeck.name}
            onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newDeck.description}
            onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Cover Image URL"
            fullWidth
            variant="outlined"
            value={newDeck.coverImageUrl}
            onChange={(e) => setNewDeck({ ...newDeck, coverImageUrl: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Color"
            type="color"
            variant="outlined"
            value={newDeck.hexColor}
            onChange={(e) => setNewDeck({ ...newDeck, hexColor: e.target.value })}
            sx={{ width: 120 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateDeck}
            variant="contained"
            disabled={!newDeck.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Deck</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDeck?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDeck} color="error" variant="contained">
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

export default DecksPage;