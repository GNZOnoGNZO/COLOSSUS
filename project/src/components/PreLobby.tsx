import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sword, Shield, Sparkles, Heart, ArrowRight, Users, Bot, Globe } from 'lucide-react';
import { DeckBuilder } from './DeckBuilder';
import { useCardStore } from '../store/cardStore';
import { useGoldStore } from '../store/goldStore';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from './ui/LoadingScreen';
import { BackButton } from './BackButton';

interface PreLobbyProps {
  onStartGame: () => void;
  onExit: () => void;
}

type GameMode = 'bot' | 'online';

// Bot AI helper functions
const getBotCoinChoice = () => {
  return Math.random() < 0.5 ? 'heads' : 'tails';
};

const getBotCardToPlay = (hand, gameState) => {
  // Simple strategy: Play highest attack card if we have less health, otherwise highest defense
  const sortedByAttack = [...hand].sort((a, b) => b.attack - a.attack);
  const sortedByDefense = [...hand].sort((a, b) => b.defense - b.defense);
  
  if (gameState.botHealth < gameState.playerHealth) {
    return sortedByAttack[0];
  }
  return sortedByDefense[0];
};

const shouldBotEndTurn = (gameState) => {
  // End turn if no cards left or if we've played 3+ cards with good board position
  return gameState.botHand.length === 0 || 
    (gameState.botPlayedCards.length >= 3 && gameState.botHealth > gameState.playerHealth);
};

export function PreLobby({ onStartGame, onExit }: PreLobbyProps) {
  const { selectedDeck } = useCardStore();
  const { outGameGold, inGameGold, transferToInGame } = useGoldStore();
  const { user } = useAuthStore();
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleStartGame = useCallback(async () => {
    if (!selectedDeck || !selectedMode) return;

    setIsLoading(true);
    
    // Simulate loading with multiple steps
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingProgress(i);
    }

    onStartGame();
  }, [selectedDeck, selectedMode, onStartGame]);

  const handleLoadGold = useCallback(() => {
    const goldNeeded = 100 - inGameGold;
    if (goldNeeded > 0 && outGameGold >= goldNeeded) {
      transferToInGame(goldNeeded);
    }
  }, [inGameGold, outGameGold, transferToInGame]);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} message={`Preparing your ${selectedMode} battle...`} />;
  }

  if (showDeckBuilder) {
    return <DeckBuilder collection={[]} onExit={() => setShowDeckBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-medieval-dark via-medieval-primary to-medieval-dark p-8">
      <BackButton onClick={onExit} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-medieval-dark/50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-medieval text-medieval-accent mb-6">Battle Preparation</h2>
          
          {/* Game Mode Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-medieval text-medieval-accent mb-4">Select Game Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={() => setSelectedMode('bot')}
                className={`p-6 rounded-lg flex flex-col items-center gap-3 transition-colors
                  ${selectedMode === 'bot'
                    ? 'bg-medieval-accent text-medieval-dark'
                    : 'bg-medieval-light/5 text-medieval-light hover:bg-medieval-light/10'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bot className="w-8 h-8" />
                <span className="font-bold">Practice Mode</span>
                <span className="text-sm opacity-80">Battle against AI</span>
              </motion.button>

              <motion.button
                onClick={() => setSelectedMode('online')}
                className={`p-6 rounded-lg flex flex-col items-center gap-3 transition-colors
                  ${selectedMode === 'online'
                    ? 'bg-medieval-accent text-medieval-dark'
                    : 'bg-medieval-light/5 text-medieval-light hover:bg-medieval-light/10'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-8 h-8" />
                <span className="font-bold">Online Mode</span>
                <span className="text-sm opacity-80">Battle other players</span>
              </motion.button>
            </div>
          </div>

          {/* Deck Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-medieval-light">Selected Deck:</span>
              <motion.button
                onClick={() => setShowDeckBuilder(true)}
                className="px-4 py-2 bg-medieval-accent text-medieval-dark rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedDeck ? 'Change Deck' : 'Select Deck'}
              </motion.button>
            </div>
            {selectedDeck ? (
              <div className="bg-medieval-light/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-medieval-accent font-bold">{selectedDeck.name}</span>
                  <span className="text-medieval-light text-sm">{selectedDeck.cards.length} Cards</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-sm text-medieval-light/70">
                    <Sword className="w-3 h-3" />
                    <span>Attack</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-medieval-light/70">
                    <Shield className="w-3 h-3" />
                    <span>Defense</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-medieval-light/70">
                    <Sparkles className="w-3 h-3" />
                    <span>Special</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-medieval-light/5 p-4 rounded-lg text-medieval-light/50 text-center">
                No deck selected
              </div>
            )}
          </div>

          {/* Gold Management */}
          <div className="mb-8">
            <h3 className="text-xl font-medieval text-medieval-accent mb-4">Gold Management</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-medieval-light/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-medieval-accent" />
                  <span className="text-medieval-light">Vault Gold</span>
                </div>
                <span className="text-2xl font-bold text-medieval-accent">{outGameGold}</span>
              </div>
              <div className="bg-medieval-light/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-medieval-accent" />
                  <span className="text-medieval-light">Battle Gold</span>
                </div>
                <span className="text-2xl font-bold text-medieval-accent">{inGameGold}/100</span>
              </div>
            </div>
            <motion.button
              onClick={handleLoadGold}
              disabled={inGameGold >= 100 || outGameGold < (100 - inGameGold)}
              className="w-full py-3 bg-medieval-accent text-medieval-dark rounded-lg disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Load Up Gold
            </motion.button>
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartGame}
            disabled={!selectedDeck || inGameGold < 100 || !selectedMode}
            className={`w-full py-4 rounded-lg flex items-center justify-center gap-3 text-lg
              ${selectedDeck && inGameGold >= 100 && selectedMode
                ? 'bg-medieval-accent text-medieval-dark'
                : 'bg-medieval-light/10 text-medieval-light/50'}`}
            whileHover={selectedDeck && inGameGold >= 100 && selectedMode ? { scale: 1.02 } : {}}
            whileTap={selectedDeck && inGameGold >= 100 && selectedMode ? { scale: 0.98 } : {}}
          >
            {selectedMode === 'online' ? (
              <>
                <Users className="w-6 h-6" />
                Start Online Battle
              </>
            ) : (
              <>
                <Bot className="w-6 h-6" />
                Start Practice Battle
              </>
            )}
            <ArrowRight className="w-6 h-6" />
          </motion.button>

          {(!selectedDeck || inGameGold < 100 || !selectedMode) && (
            <div className="text-sm text-red-500 text-center mt-4">
              {!selectedMode
                ? 'Select a game mode to continue'
                : !selectedDeck 
                  ? 'Select a deck to battle' 
                  : `Load up ${100 - inGameGold} more gold to start battle`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}