import React, { useState } from 'react';
import {
  Box,
  Typography,
  Fab,
  Container,
  Paper,
} from '@mui/material';
import {
  Add,
  AutoStories,
  Lightbulb,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Deck, PostDeckDto, PutDeckDto } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import DeckFormModal from '../components/DeckFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SearchAndActionsBar from '../components/SearchAndActionsBar';
import DecksGrid from '../components/DecksGrid';
import Notification from '../components/Notification';
import { useDecksManager } from '../hooks/useDecksManager';

const DecksPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Deck management hook
  const {
    decks,
    loading,
    error,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    filteredDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    refresh,
  } = useDecksManager();
  
  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  
  // Form states
  const [newDeck, setNewDeck] = useState<PostDeckDto>({
    name: '',
    description: '',
    coverImageUrl: '',
    hexColor: '#1976d2',
  });
  
  const [editDeck, setEditDeck] = useState<PutDeckDto>({
    name: '',
    description: '',
    coverImageUrl: '',
    hexColor: '#1976d2',
  });
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Handlers
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleCreateDeck = async () => {
    setIsCreating(true);
    const success = await createDeck(newDeck);
    
    if (success) {
      setCreateDialogOpen(false);
      setNewDeck({
        name: '',
        description: '',
        coverImageUrl: '',
        hexColor: '#1976d2',
      });
      setNotification({
        open: true,
        message: 'Deck created successfully!',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: 'Failed to create deck. Please try again.',
        severity: 'error',
      });
    }
    setIsCreating(false);
  };

  const handleEditDeck = async () => {
    if (!selectedDeck) return;
    
    setIsUpdating(true);
    const success = await updateDeck(selectedDeck.id, editDeck);
    
    if (success) {
      setEditDialogOpen(false);
      setSelectedDeck(null);
      setEditDeck({
        name: '',
        description: '',
        coverImageUrl: '',
        hexColor: '#1976d2',
      });
      setNotification({
        open: true,
        message: 'Deck updated successfully!',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: 'Failed to update deck. Please try again.',
        severity: 'error',
      });
    }
    setIsUpdating(false);
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    
    setIsDeleting(true);
    const success = await deleteDeck(selectedDeck.id);
    
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedDeck(null);
      setNotification({
        open: true,
        message: 'Deck deleted successfully!',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: 'Failed to delete deck. Please try again.',
        severity: 'error',
      });
    }
    setIsDeleting(false);
  };

  const openEditDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setEditDeck({
      name: deck.name,
      description: deck.description || '',
      coverImageUrl: deck.coverImageUrl || '',
      hexColor: deck.hexColor,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeleteDialogOpen(true);
  };

  const handleEditDeckChange = (deck: PostDeckDto | PutDeckDto) => {
    setEditDeck(deck as PutDeckDto);
  };

  const handleNewDeckChange = (deck: PostDeckDto | PutDeckDto) => {
    setNewDeck(deck as PostDeckDto);
  };

  const handleDebugTest = () => {
    console.log('Debug test action triggered');
  };

  if (loading) {
    return <LoadingSpinner message="Loading decks..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Header */}
      <Box 
        sx={{ 
          mb: 6,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <AutoStories 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            My Study Decks
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            fontWeight: 400,
            mb: 3,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Organize your knowledge, boost your learning
        </Typography>

        {/* Quick stats */}
        <Paper
          elevation={0}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            px: 3,
            py: 1.5,
            borderRadius: 20,
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoStories sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              <strong>{decks?.content?.length || 0}</strong> decks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb sx={{ fontSize: 20, color: 'warning.main' }} />
            <Typography variant="body2" color="text.secondary">
              <strong>{decks?.content?.reduce((sum, deck) => sum + (deck.cardsCount || 0), 0) || 0}</strong> cards
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Search and Actions Bar */}
      <SearchAndActionsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        onCreateNew={() => setCreateDialogOpen(true)}
        isLoading={loading}
        createLabel="Create Deck"
        showDebugActions={true}
        onDebugAction={handleDebugTest}
      />

      {/* Debug Info - remove in production */}
      {import.meta.env.DEV && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Debug Info:</strong><br />
            Loading: {loading.toString()}<br />
            Error: {error || 'none'}<br />
            Decks object: {decks ? 'exists' : 'null'}<br />
            Content length: {decks?.content?.length || 0}<br />
            Filtered length: {filteredDecks.length}<br />
            Search query: "{searchQuery}"
          </Typography>
        </Box>
      )}

      {/* Decks Grid */}
      <DecksGrid
        decks={decks}
        filteredDecks={filteredDecks}
        searchQuery={searchQuery}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onViewDeck={(deck: Deck) => navigate(`/decks/${deck.id}/cards`)}
        onEditDeck={openEditDialog}
        onDeleteDeck={openDeleteDialog}
        onCreateDeck={() => setCreateDialogOpen(true)}
      />

      {/* Floating Action Button - Enhanced */}
      <Fab
        color="primary"
        aria-label="add deck"
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 24, sm: 32 },
          display: { xs: 'flex', md: 'none' },
          size: 'large',
          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
          '&:hover': {
            boxShadow: '0 12px 35px rgba(25, 118, 210, 0.5)',
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add sx={{ fontSize: 28 }} />
      </Fab>

      {/* Create Deck Modal */}
      <DeckFormModal
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateDeck}
        deck={newDeck}
        onChange={handleNewDeckChange}
        title="Create New Deck"
        submitLabel="Create"
        isSubmitting={isCreating}
      />

      {/* Edit Deck Modal */}
      <DeckFormModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditDeck}
        deck={editDeck}
        onChange={handleEditDeckChange}
        title="Edit Deck"
        submitLabel="Update"
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDeck}
        item={selectedDeck}
        isDeleting={isDeleting}
        itemType="Deck"
      />

      {/* Notification */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Container>
  );
};

export default DecksPage;