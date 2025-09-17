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
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`);
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    console.error('Full error object:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return Promise.reject(error);
  }
);

export const deckService = {
  // Test connectivity
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      const response = await api.get('/decks?page=0&size=1');
      console.log('Connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        if ('response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.error('Response status:', axiosError.response?.status);
          console.error('Response data:', axiosError.response?.data);
        }
        if ('code' in error) {
          console.error('Error code:', (error as { code?: string }).code);
        }
      }
      return false;
    }
  },

  // Get all decks with pagination
  getAll: (page = 0, size = 10): Promise<Page<Deck>> => {
    console.log(`Getting decks: page=${page}, size=${size}`);
    const url = `/decks?page=${page}&size=${size}`;
    console.log('Full URL:', `${API_BASE_URL}${url}`);
    return api.get(url).then(res => {
      console.log('Deck service response:', res.data);
      console.log('Response type:', typeof res.data);
      console.log('Has content property:', 'content' in res.data);
      console.log('Content is array:', Array.isArray(res.data.content));
      return res.data;
    }).catch(error => {
      console.error('Error in deckService.getAll:', error);
      throw error;
    });
  },

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