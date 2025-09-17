import { useState, useEffect, useMemo } from 'react';
import { deckService } from '../services/api';
import { useErrorHandler } from './useErrorHandler';
import type { Deck, PostDeckDto, PutDeckDto, Page } from '../types/api';

interface UseDecksManagerOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UseDecksManagerReturn {
  // Data state
  decks: Page<Deck> | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredDecks: Deck[];
  
  // Operations
  loadDecks: (page?: number) => Promise<void>;
  createDeck: (deck: PostDeckDto) => Promise<boolean>;
  updateDeck: (id: string, deck: PutDeckDto) => Promise<boolean>;
  deleteDeck: (id: string) => Promise<boolean>;
  
  // Utilities
  refresh: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

export function useDecksManager(options: UseDecksManagerOptions = {}): UseDecksManagerReturn {
  const { initialPage = 1, pageSize = 12 } = options;
  
  // State
  const [decks, setDecks] = useState<Page<Deck> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Error handler
  const { handleError } = useErrorHandler({
    onRetryableError: () => {
      setTimeout(() => loadDecks(currentPage), 3000);
    }
  });

  // Load decks function
  const loadDecks = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading decks - page:', page);
      const data = await deckService.getAll(page - 1, pageSize);
      console.log('API Response:', data);
      setDecks(data);
    } catch (err) {
      console.error('Error loading decks:', err);
      handleError(err, 'load decks');
      setError('Failed to load decks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test connection
  const testConnection = async (): Promise<boolean> => {
    const isConnected = await deckService.testConnection();
    console.log('API connectivity test:', isConnected);
    
    if (!isConnected) {
      setError('Unable to connect to API. Please check if the server is running on http://localhost:8080');
      setLoading(false);
      return false;
    }
    return true;
  };

  // Create deck
  const createDeck = async (deck: PostDeckDto): Promise<boolean> => {
    try {
      await deckService.create(deck);
      await loadDecks(currentPage);
      return true;
    } catch (err) {
      console.error('Error creating deck:', err);
      handleError(err, 'create deck');
      return false;
    }
  };

  // Update deck
  const updateDeck = async (id: string, deck: PutDeckDto): Promise<boolean> => {
    try {
      await deckService.update(id, deck);
      await loadDecks(currentPage);
      return true;
    } catch (err) {
      console.error('Error updating deck:', err);
      handleError(err, 'update deck');
      return false;
    }
  };

  // Delete deck
  const deleteDeck = async (id: string): Promise<boolean> => {
    try {
      await deckService.delete(id);
      await loadDecks(currentPage);
      return true;
    } catch (err) {
      console.error('Error deleting deck:', err);
      handleError(err, 'delete deck');
      return false;
    }
  };

  // Refresh function
  const refresh = async () => {
    await loadDecks(currentPage);
  };

  // Initial load
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      
      const isConnected = await testConnection();
      if (!isConnected) return;
      
      await loadDecks(currentPage);
    };
    
    initializeApp();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered decks based on search
  const filteredDecks = useMemo(() => {
    if (!decks?.content) {
      console.log('No decks content available');
      return [];
    }
    
    if (!searchQuery.trim()) {
      console.log('No search query, returning all decks:', decks.content.length);
      return decks.content;
    }
    
    const filtered = decks.content.filter(deck =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('Filtered decks:', filtered.length, 'from', decks.content.length);
    return filtered;
  }, [decks?.content, searchQuery]);

  return {
    // Data state
    decks,
    loading,
    error,
    
    // Pagination
    currentPage,
    setCurrentPage,
    
    // Search
    searchQuery,
    setSearchQuery,
    filteredDecks,
    
    // Operations
    loadDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    
    // Utilities
    refresh,
    testConnection,
  };
}

export default useDecksManager;