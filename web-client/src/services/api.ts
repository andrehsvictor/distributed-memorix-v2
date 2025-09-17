import axios from 'axios';
import type { 
  Deck, 
  Card, 
  CardWithDeck, 
  PostDeckDto, 
  PutDeckDto, 
  PostCardDto, 
  PutCardDto, 
  Page 
} from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api/v2';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const deckService = {
  // Get all decks with pagination
  getAll: (page = 0, size = 10): Promise<Page<Deck>> =>
    api.get(`/decks?page=${page}&size=${size}`).then(res => res.data),

  // Get deck by ID
  getById: (id: string): Promise<Deck> =>
    api.get(`/decks/${id}`).then(res => res.data),

  // Create new deck
  create: (deck: PostDeckDto): Promise<Deck> =>
    api.post('/decks', deck).then(res => res.data),

  // Update deck
  update: (id: string, deck: PutDeckDto): Promise<Deck> =>
    api.put(`/decks/${id}`, deck).then(res => res.data),

  // Delete deck
  delete: (id: string): Promise<void> =>
    api.delete(`/decks/${id}`).then(() => undefined),

  // Delete multiple decks
  deleteMultiple: (ids: string[]): Promise<void> =>
    api.delete('/decks', { data: ids }).then(() => undefined),

  // Check if deck exists
  exists: (id: string): Promise<boolean> =>
    api.head(`/decks/${id}`)
      .then(() => true)
      .catch(() => false),
};

export const cardService = {
  // Get all cards with pagination
  getAll: (page = 0, size = 10): Promise<Page<CardWithDeck>> =>
    api.get(`/cards?page=${page}&size=${size}`).then(res => res.data),

  // Get card by ID
  getById: (id: string): Promise<CardWithDeck> =>
    api.get(`/cards/${id}`).then(res => res.data),

  // Get cards by deck ID
  getByDeckId: (deckId: string, page = 0, size = 10): Promise<Page<Card>> =>
    api.get(`/decks/${deckId}/cards?page=${page}&size=${size}`).then(res => res.data),

  // Create new card in deck
  create: (deckId: string, card: PostCardDto): Promise<CardWithDeck> =>
    api.post(`/decks/${deckId}/cards`, card).then(res => res.data),

  // Update card
  update: (id: string, card: PutCardDto): Promise<CardWithDeck> =>
    api.put(`/cards/${id}`, card).then(res => res.data),

  // Delete card
  delete: (id: string): Promise<void> =>
    api.delete(`/cards/${id}`).then(() => undefined),
};

export default api;