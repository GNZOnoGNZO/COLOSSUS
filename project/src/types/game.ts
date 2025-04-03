export interface CardTemplate {
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
  validSlots?: (keyof PlayerState['field'])[];
  remainingDuration?: number;
  isExhausted?: boolean; // Track if card has been used this turn
}

export type CardType = 
  | 'human'
  | 'nonhuman'
  | 'celestial' 
  | 'location'
  | 'event'
  | 'object'
  | 'passive'
  | 'unidentifiable';

export interface CardEffect {
  type: 'immediate' | 'ongoing' | 'delayed' | 'prevention';
  duration?: number;
  startRound: number;
  endRound?: number;
  effect: (card: CardTemplate, gameState: GameState) => boolean | void;
  condition?: (gameState: GameState) => boolean;
  message?: string;
  cardId: string;
  priority?: number; // For effect resolution order
}

export interface GameState {
  players: {
    [key: string]: PlayerState;
  };
  bank: {
    gold: number;
  };
  currentRound: number;
  activePlayer: string;
  crypt: CardTemplate[];
  turnPhase: TurnPhase;
  cardTallies: {
    celestial: number;
    unidentifiable: number;
    human: number;
    nonhuman: number;
  };
  activeEffects: CardEffect[];
  lastPlayedCard?: CardTemplate;
  combatLog: string[];
  winner?: string;
  coinCallAttempts: number;
  turnHistory: TurnAction[];
  turnTimeRemaining: number;
  isGameOver: boolean;
  roundStartTime: number; // Track when round started
  turnStartTime: number; // Track when turn started
  pendingEffects: CardEffect[]; // Queue for effects waiting to resolve
}

export interface TurnAction {
  player: string;
  action: 'play' | 'attack' | 'draw' | 'pass' | 'coinFlip' | 'activate'; // Added activate for card abilities
  card?: CardTemplate;
  target?: string;
  timestamp: number;
  cost?: number; // Track resource costs
}

export interface PlayerState {
  health: number;
  inGameGold: number;
  outGameGold: number;
  hand: CardTemplate[];
  field: {
    humanNonhuman: CardTemplate | null;
    celestialLocation: CardTemplate | null;
    eventItem: CardTemplate | null;
  };
  deck: CardTemplate[];
  movesRemaining: number;
  removedCards: CardTemplate[];
  shield: number;
  effects: CardEffect[];
  isReady: boolean;
  hasPlayedCard: boolean;
  hasAttacked: boolean;
  actionsThisTurn: number; // Track number of actions taken
  cardsPlayedThisTurn: CardTemplate[]; // Track cards played this turn
}

export type TurnPhase = 
  | 'setup' // Added setup phase
  | 'coin-flip'
  | 'draw'
  | 'main'
  | 'attack'
  | 'effect'
  | 'cleanup' // Added cleanup phase
  | 'end';

export const PLACEMENT_RULES: Record<CardType, (keyof PlayerState['field'])[]> = {
  human: ['humanNonhuman'],
  nonhuman: ['humanNonhuman'],
  celestial: ['celestialLocation'],
  location: ['celestialLocation'],
  event: ['eventItem'],
  object: ['eventItem'],
  passive: [],
  unidentifiable: ['humanNonhuman', 'celestialLocation', 'eventItem']
};

export const GAME_CONSTANTS = {
  STARTING_HEALTH: 100,
  STARTING_GOLD: 50,
  BANK_STARTING_GOLD: 100,
  DECK_SIZE: 20,
  MAX_MOVES_PER_TURN: 3,
  MAX_CARD_COPIES: 2,
  TURN_TIME_LIMIT: 90, // Increased time limit
  MIN_DECK_SIZE: 20,
  MAX_DECK_SIZE: 20,
  STARTING_HAND_SIZE: 3, // Increased starting hand
  DRAW_PER_TURN: 1,
  MAX_FIELD_CARDS: 3,
  MAX_HAND_SIZE: 7, // Increased hand size
  TYPE_SYNERGY_BONUS: 2,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 2,
  COIN_FLIP_ATTEMPTS_MAX: 3,
  TURN_PHASES: ['setup', 'coin-flip', 'draw', 'main', 'attack', 'effect', 'cleanup', 'end'] as const,
  ATTACK_DAMAGE_BASE: 10,
  DEFENSE_REDUCTION_FACTOR: 0.5,
  MAX_ACTIONS_PER_TURN: 3, // New constant
  EFFECT_RESOLUTION_WINDOW: 2000, // Time window for effect resolution in ms
} as const;

export interface GameRules {
  canPlayCard: (card: CardTemplate, gameState: GameState, player: string) => boolean;
  canAttack: (gameState: GameState, attacker: string, target: string) => boolean;
  isValidMove: (gameState: GameState, action: TurnAction) => boolean;
  calculateDamage: (attacker: CardTemplate, defender: CardTemplate) => number;
  checkWinCondition: (gameState: GameState) => string | undefined;
  advanceTurnPhase: (gameState: GameState) => void;
  handleCardEffect: (card: CardTemplate, gameState: GameState) => void;
  resolveEffects: (gameState: GameState) => void; // New method for effect resolution
  cleanupPhase: (gameState: GameState) => void; // New method for turn cleanup
  checkTiming: (gameState: GameState) => void; // New method for timing checks
}