import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardTemplate } from '../types/game';
import { allCards } from '../data/cards';
import { Deck } from '../types/cards';

interface CardState {
  collection: CardTemplate[];
  decks: Deck[];
  recentlyAcquired: CardTemplate[];
  selectedDeck: Deck | null;
  hasReceivedWelcomePack: boolean;
  addToCollection: (cards: CardTemplate[]) => void;
  clearRecentlyAcquired: () => void;
  getCardById: (id: string) => CardTemplate | undefined;
  saveDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  selectDeck: (deck: Deck | null) => void;
  giveWelcomePack: () => void;
  isCardOwned: (cardId: string) => boolean;
  resetStore: () => void;
}

const getRandomCards = (count: number): CardTemplate[] => {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const initialState = {
  collection: [],
  decks: [],
  recentlyAcquired: [],
  selectedDeck: null,
  hasReceivedWelcomePack: false,
};

export const useCardStore = create(
  persist<CardState>(
    (set, get) => ({
      ...initialState,
      addToCollection: (cards) => set((state) => {
        const newCollection = [...state.collection];
        const newRecentlyAcquired = [];

        for (const card of cards) {
          const existingCardCount = newCollection.filter(c => c.id === card.id).length;
          if (existingCardCount < 2) { // Maximum 2 copies of each card
            newCollection.push(card);
            newRecentlyAcquired.push(card);
          }
        }

        return {
          collection: newCollection,
          recentlyAcquired: newRecentlyAcquired,
        };
      }),
      clearRecentlyAcquired: () => set({ recentlyAcquired: [] }),
      getCardById: (id) => allCards.find(card => card.id === id),
      saveDeck: (deck) => set((state) => ({
        decks: [...state.decks.filter(d => d.id !== deck.id), deck],
        selectedDeck: deck,
      })),
      deleteDeck: (deckId) => set((state) => ({
        decks: state.decks.filter(d => d.id !== deckId),
        selectedDeck: state.selectedDeck?.id === deckId ? null : state.selectedDeck,
      })),
      selectDeck: (deck) => set({ selectedDeck: deck }),
      giveWelcomePack: () => set((state) => {
        if (state.hasReceivedWelcomePack) return state;

        const welcomeCards = getRandomCards(20);
        return {
          collection: [...state.collection, ...welcomeCards],
          recentlyAcquired: welcomeCards,
          hasReceivedWelcomePack: true,
        };
      }),
      isCardOwned: (cardId) => {
        const state = get();
        return state.collection.some(card => card.id === cardId);
      },
      resetStore: () => set(initialState),
    }),
    {
      name: 'colossus-cards',
    }
  )
);