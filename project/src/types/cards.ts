import { CardType } from './game';

export interface Card {
  id: string;
  name: string;
  year: string;
  types: CardType[];
  description: string;
  effect: string;
  duration?: number;
  cost: number;
  imageUrl?: string;
  power?: number;
  defense?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export interface PlayerCollection {
  cards: Card[];
  decks: Deck[];
}

export interface PackReward {
  type: 'card' | 'gold';
  card?: Card;
  goldAmount?: number;
}

export interface PackResult {
  rewards: PackReward[];
  totalGold: number;
}