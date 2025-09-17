import React, { useState } from 'react';
import {
  Box,
  Typography,
  Fab,
} from '@mui/material';
import {
  Add,
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
    <Box>
      {/* Page Title */}
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        My Decks
      </Typography>

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

      {/* Floating Action Button - apenas em mobile */}
      <Fab
        color="primary"
        aria-label="add deck"
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
    </Box>
  );
};

export default DecksPage;