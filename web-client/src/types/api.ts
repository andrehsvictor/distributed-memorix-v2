export interface Deck {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  hexColor: string;
  cardsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  deckId: string;
  deckName?: string;
  deckCoverImageUrl?: string;
  deckCardsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardWithDeck {
  id: string;
  question: string;
  answer: string;
  deck: Deck;
  createdAt: string;
  updatedAt: string;
}

export interface PostDeckDto {
  name: string;
  description?: string;
  coverImageUrl?: string;
  hexColor?: string;
}

export interface PutDeckDto {
  name: string;
  description?: string;
  coverImageUrl?: string;
  hexColor: string;
}

export interface PostCardDto {
  question: string;
  answer: string;
}

export interface PutCardDto {
  question: string;
  answer: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}