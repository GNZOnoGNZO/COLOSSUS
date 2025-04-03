import { create } from 'zustand';
import { CardTemplate, GameState, GAME_CONSTANTS, PlayerState, PLACEMENT_RULES } from '../types/game';
import { allCards } from '../data/cards';
import { useGoldStore } from './goldStore';

interface GameStore {
  gameState: GameState | null;
  initializeGame: (playerDeck: CardTemplate[]) => void;
  playCard: (card: CardTemplate, slot: keyof PlayerState['field']) => void;
  endTurn: () => void;
  setFirstPlayer: (playerId: string) => void;
  handleCoinCall: (call: 'heads' | 'tails') => boolean;
  resetStore: () => void;
}

const shuffleDeck = (deck: CardTemplate[]): CardTemplate[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.map(card => ({
    ...card,
    validSlots: card.types.reduce((slots, type) => {
      const validSlots = PLACEMENT_RULES[type] || [];
      return [...new Set([...slots, ...validSlots])];
    }, [] as (keyof PlayerState['field'])[])
  }));
};

const createInitialPlayerState = (deck: CardTemplate[]): PlayerState => ({
  health: GAME_CONSTANTS.STARTING_HEALTH,
  inGameGold: 0,
  outGameGold: 0,
  hand: [],
  field: {
    humanNonhuman: null,
    celestialLocation: null,
    eventItem: null,
  },
  deck: shuffleDeck([...deck]),
  movesRemaining: GAME_CONSTANTS.MAX_MOVES_PER_TURN,
  removedCards: [],
  shield: 0,
  effects: [],
});

const createInitialGameState = (playerDeck: CardTemplate[]): GameState => {
  if (playerDeck.length !== GAME_CONSTANTS.MIN_DECK_SIZE) {
    throw new Error(`Deck must contain exactly ${GAME_CONSTANTS.MIN_DECK_SIZE} cards`);
  }

  // Create AI deck by randomly selecting cards
  const aiDeck = shuffleDeck(allCards.slice(0, GAME_CONSTANTS.MIN_DECK_SIZE));

  return {
    players: {
      player1: createInitialPlayerState(playerDeck),
      player2: createInitialPlayerState(aiDeck),
    },
    bank: {
      gold: GAME_CONSTANTS.BANK_STARTING_GOLD,
    },
    currentRound: 1,
    activePlayer: '',
    crypt: [],
    turnPhase: 'coin-flip',
    cardTallies: {
      celestial: 0,
      unidentifiable: 0,
      human: 0,
      nonhuman: 0,
    },
    activeEffects: [],
    combatLog: ['Game started! Waiting for coin flip...'],
    coinCallAttempts: 0,
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  initializeGame: (playerDeck) => {
    try {
      const initialState = createInitialGameState(playerDeck);
      
      // Initialize in-game gold from the gold store
      const goldStore = useGoldStore.getState();
      goldStore.initializeGameGold();
      
      // Update the game state with the initialized gold
      initialState.players.player1.inGameGold = goldStore.inGameGold;
      
      set({ gameState: initialState });
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  },
  playCard: (card, slot) => {
    set((state) => {
      if (!state.gameState) return state;

      const currentPlayer = state.gameState.players[state.gameState.activePlayer];
      const goldStore = useGoldStore.getState();
      
      // Check if the card can be played
      if (!currentPlayer || 
          currentPlayer.movesRemaining <= 0 || 
          currentPlayer.field[slot] || 
          !card.validSlots?.includes(slot) ||
          goldStore.inGameGold < card.cost) {
        return state;
      }

      // Find the card in the player's hand
      const handIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
      if (handIndex === -1) return state;

      // Update gold
      goldStore.updateInGameGold(-card.cost);

      const newState = { ...state.gameState };
      const newHand = [...currentPlayer.hand];
      newHand.splice(handIndex, 1);

      // Add duration to the card if it has one
      const playedCard = { ...card };
      if (playedCard.duration) {
        playedCard.remainingDuration = playedCard.duration;
      }

      newState.players[state.gameState.activePlayer] = {
        ...currentPlayer,
        hand: newHand,
        field: {
          ...currentPlayer.field,
          [slot]: playedCard,
        },
        movesRemaining: currentPlayer.movesRemaining - 1,
      };

      // Update card tallies
      playedCard.types.forEach(type => {
        if (type in newState.cardTallies) {
          newState.cardTallies[type as keyof typeof newState.cardTallies]++;
        }
      });

      newState.lastPlayedCard = playedCard;
      newState.combatLog.push(`${state.gameState.activePlayer} played ${playedCard.name}`);

      return { gameState: newState };
    });
  },
  endTurn: () => {
    set((state) => {
      if (!state.gameState) return state;

      const newState = { ...state.gameState };
      const nextPlayer = newState.activePlayer === 'player1' ? 'player2' : 'player1';

      // Process active effects
      newState.activeEffects = newState.activeEffects.filter(effect => {
        if (effect.duration && effect.duration > 0) {
          effect.effect(effect.cardId as unknown as CardTemplate, newState);
          effect.duration--;
          return effect.duration > 0;
        }
        return false;
      });

      // Update card durations
      Object.values(newState.players).forEach(player => {
        Object.entries(player.field).forEach(([slot, card]) => {
          if (card?.remainingDuration) {
            card.remainingDuration--;
            if (card.remainingDuration <= 0) {
              player.removedCards.push(card);
              player.field[slot as keyof PlayerState['field']] = null;
              newState.combatLog.push(`${card.name} expires and is sent to the crypt`);
            }
          }
        });
      });

      // Reset moves and update active player
      newState.players[newState.activePlayer].movesRemaining = GAME_CONSTANTS.MAX_MOVES_PER_TURN;
      newState.activePlayer = nextPlayer;
      newState.turnPhase = 'draw';

      // Draw cards for the next player
      const currentPlayer = newState.players[nextPlayer];
      for (let i = 0; i < GAME_CONSTANTS.DRAW_PER_TURN; i++) {
        if (currentPlayer.hand.length < GAME_CONSTANTS.MAX_HAND_SIZE && currentPlayer.deck.length > 0) {
          const card = currentPlayer.deck.pop();
          if (card) currentPlayer.hand.push(card);
        }
      }

      // Update round counter
      if (nextPlayer === 'player1') {
        newState.currentRound++;
        newState.combatLog.push(`Round ${newState.currentRound} begins!`);
      }

      return { gameState: newState };
    });
  },
  handleCoinCall: (call) => {
    const state = get().gameState;
    if (!state) return false;

    const result = Math.random() > 0.5 ? 'heads' : 'tails';
    const newState = { ...state };
    
    if (call === result || newState.coinCallAttempts >= 3) {
      // Correct call or max attempts reached
      const firstPlayer = newState.coinCallAttempts >= 3 
        ? Math.random() > 0.5 ? 'player1' : 'player2'
        : call === result ? 'player1' : 'player2';
      
      newState.activePlayer = firstPlayer;
      newState.turnPhase = 'draw';
      newState.combatLog.push(`${firstPlayer} goes first!`);
      
      // Draw initial hands for both players
      ['player1', 'player2'].forEach(playerId => {
        const player = newState.players[playerId];
        const handSize = Math.min(GAME_CONSTANTS.STARTING_HAND_SIZE, GAME_CONSTANTS.MAX_HAND_SIZE);
        for (let i = 0; i < handSize; i++) {
          if (player.deck.length > 0) {
            const card = player.deck.pop();
            if (card) player.hand.push(card);
          }
        }
      });
      
      set({ gameState: newState });
      return true;
    } else {
      // Wrong call
      newState.coinCallAttempts++;
      newState.combatLog.push(`Wrong call! Attempts: ${newState.coinCallAttempts}/3`);
      set({ gameState: newState });
      return false;
    }
  },
  setFirstPlayer: (playerId) => {
    set((state) => {
      if (!state.gameState) return state;

      const newState = { ...state.gameState };
      newState.activePlayer = playerId;
      newState.turnPhase = 'draw';
      newState.combatLog.push(`${playerId} goes first!`);

      // Draw initial hands for both players
      ['player1', 'player2'].forEach(playerId => {
        const player = newState.players[playerId];
        const handSize = Math.min(GAME_CONSTANTS.STARTING_HAND_SIZE, GAME_CONSTANTS.MAX_HAND_SIZE);
        for (let i = 0; i < handSize; i++) {
          if (player.deck.length > 0) {
            const card = player.deck.pop();
            if (card) player.hand.push(card);
          }
        }
      });

      return { gameState: newState };
    });
  },
  resetStore: () => set({ gameState: null }),
}));