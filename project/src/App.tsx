import React, { useState, useEffect } from 'react';
import { Coins, ScrollText, ChevronRight, ShoppingCart, Book, Trash2, RefreshCw } from 'lucide-react';
import GameBoard from './components/GameBoard';
import { DeckBuilder } from './components/DeckBuilder';
import { Shop } from './components/Shop';
import { Auth } from './components/Auth';
import { PreLobby } from './components/PreLobby';
import { AllCards } from './components/AllCards';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useGameStore } from './store/gameStore';
import { useCardStore } from './store/cardStore';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CONSTANTS } from './types/game';

function App() {
  const { isDarkMode } = useThemeStore();
  const { user, loadProfile, signOut } = useAuthStore();
  const { collection, selectedDeck, resetStore: resetCardStore } = useCardStore();
  const { initializeGame } = useGameStore();
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [showPreLobby, setShowPreLobby] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleStartGame = () => {
    try {
      setError(null);
      let gameCards;

      if (selectedDeck) {
        if (selectedDeck.cards.length !== GAME_CONSTANTS.MIN_DECK_SIZE) {
          throw new Error(`Your deck must have exactly ${GAME_CONSTANTS.MIN_DECK_SIZE} cards`);
        }
        gameCards = selectedDeck.cards;
      } else if (collection.length >= GAME_CONSTANTS.MIN_DECK_SIZE) {
        gameCards = collection.slice(0, GAME_CONSTANTS.MIN_DECK_SIZE);
      } else {
        throw new Error(`You need at least ${GAME_CONSTANTS.MIN_DECK_SIZE} cards to play`);
      }

      initializeGame(gameCards);
      setGameStarted(true);
      setShowPreLobby(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (user?.isGuest) {
        resetCardStore();
        await signOut();
      } else {
        await signOut();
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  if (!user) {
    return <Auth onAuthSuccess={loadProfile} />;
  }

  if (showShop) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark">
          <ThemeToggle />
          <Shop onExit={() => setShowShop(false)} />
        </div>
      </div>
    );
  }

  if (showDeckBuilder) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark">
          <ThemeToggle />
          <DeckBuilder
            collection={collection}
            onExit={() => setShowDeckBuilder(false)}
          />
        </div>
      </div>
    );
  }

  if (showAllCards) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark">
          <ThemeToggle />
          <AllCards onExit={() => setShowAllCards(false)} />
        </div>
      </div>
    );
  }

  if (showPreLobby) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark">
          <ThemeToggle />
          <PreLobby onStartGame={handleStartGame} onExit={() => setShowPreLobby(false)} />
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark">
          <ThemeToggle />
          <GameBoard onExit={() => setGameStarted(false)} />
        </div>
      </div>
    );
  }

  const canStartGame = selectedDeck?.cards.length === GAME_CONSTANTS.MIN_DECK_SIZE || 
                      (!selectedDeck && collection.length >= GAME_CONSTANTS.MIN_DECK_SIZE);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark transition-colors duration-300">
        <ThemeToggle />
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-4xl md:text-6xl font-medieval font-extrabold text-medieval-primary dark:text-medieval-light mb-4">
                  COLOSSUS UNIVERSE
                </h1>
                <div className="flex items-center gap-4 bg-medieval-dark/20 px-4 py-2 rounded-lg">
                  <span className="text-sm text-medieval-light">Welcome, {user.username}!</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-medieval-accent" />
                    <span className="text-sm text-medieval-light">{user.gold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-medieval-accent" />
                    <span className="text-sm text-medieval-light">XP: {user.experience}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-medieval-secondary dark:text-medieval-accent mb-12 max-w-2xl mx-auto">
                The world's first card game where victory means real gold in your hands. 
                Master the flow of gold through strategic card play and claim the spoils of battle.
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <motion.button 
                  onClick={() => setShowPreLobby(true)}
                  disabled={!canStartGame}
                  className={`
                    w-64 bg-medieval-primary text-medieval-light font-bold py-3 px-8 rounded-lg 
                    transform transition-all duration-200 flex items-center justify-center
                    ${canStartGame 
                      ? 'hover:bg-medieval-secondary hover:scale-105' 
                      : 'opacity-50 cursor-not-allowed'}
                  `}
                  whileHover={canStartGame ? { scale: 1.05 } : undefined}
                  whileTap={canStartGame ? { scale: 0.95 } : undefined}
                >
                  {selectedDeck ? `Play with ${selectedDeck.name}` : 'Play Now'} <ChevronRight className="ml-2" />
                </motion.button>
                <motion.button 
                  onClick={() => setShowDeckBuilder(true)}
                  className="w-64 bg-medieval-secondary hover:bg-medieval-primary text-medieval-light font-bold py-3 px-8 rounded-lg 
                    transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Deck Builder <ScrollText className="ml-2" />
                </motion.button>
                <motion.button 
                  onClick={() => setShowShop(true)}
                  className="w-64 bg-medieval-accent hover:bg-medieval-primary text-medieval-dark hover:text-medieval-light font-bold py-3 px-8 rounded-lg 
                    transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Card Shop <ShoppingCart className="ml-2" />
                </motion.button>
                <motion.button 
                  onClick={() => setShowAllCards(true)}
                  className="w-64 bg-medieval-light/10 hover:bg-medieval-primary text-medieval-light font-bold py-3 px-8 rounded-lg 
                    transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All Cards <Book className="ml-2" />
                </motion.button>

                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-64 mt-4 flex items-center justify-center gap-2 px-8 py-3 rounded-lg transform hover:scale-105 transition-all duration-200
                    bg-red-500/10 hover:bg-red-500/20 text-red-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.isGuest ? (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Reset Guest Data
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </>
                  )}
                </motion.button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
              )}
              {!canStartGame && !error && (
                <p className="mt-4 text-sm text-red-500">
                  {selectedDeck 
                    ? `Your selected deck must have exactly ${GAME_CONSTANTS.MIN_DECK_SIZE} cards`
                    : `You need at least ${GAME_CONSTANTS.MIN_DECK_SIZE} cards to start playing. Visit the Card Shop to get more cards!`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-medieval-dark p-6 rounded-lg max-w-md w-full"
              >
                <h3 className="text-xl font-medieval text-red-500 mb-4">
                  {user.isGuest ? 'Reset Guest Data?' : 'Delete Account?'}
                </h3>
                <p className="text-medieval-light mb-6">
                  {user.isGuest
                    ? 'This will reset all your progress, cards, and gold. You will start fresh with a new guest account.'
                    : 'This action cannot be undone. All your progress, cards, and gold will be permanently deleted.'}
                </p>
                <div className="flex gap-4">
                  <motion.button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {user.isGuest ? 'Reset Data' : 'Delete Account'}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-medieval-light/10 text-medieval-light hover:bg-medieval-light/20 py-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;