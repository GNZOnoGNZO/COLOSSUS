import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card as CardType, Deck } from '../types/cards';
import { Card } from './Card';
import { ScrollText, Plus, Save, Trash2, Filter, Search, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BackButton } from './BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { GAME_CONSTANTS } from '../types/game';
import { useCardStore } from '../store/cardStore';
import { FixedSizeGrid } from 'react-window';
import useMeasure from 'react-use-measure';

interface DeckBuilderProps {
  collection: CardType[];
  onExit: () => void;
}

type FilterType = 'all' | 'human' | 'nonhuman' | 'celestial' | 'event' | 'location' | 'object';
type SortType = 'name' | 'cost' | 'type';
type DeckStrategy = 'aggro' | 'control' | 'midrange' | 'combo';

const STRATEGY_DESCRIPTIONS = {
  aggro: 'Fast-paced deck focused on dealing damage quickly',
  control: 'Defensive deck that aims to control the board',
  midrange: 'Balanced deck with a mix of early and late game cards',
  combo: 'Deck built around powerful card combinations'
};

export function DeckBuilder({ collection, onExit }: DeckBuilderProps) {
  const { decks, selectedDeck, saveDeck, deleteDeck, selectDeck } = useCardStore();
  const [deckName, setDeckName] = useState('');
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('cost');
  const [showDeckList, setShowDeckList] = useState(false);
  const [showAutoBuild, setShowAutoBuild] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<DeckStrategy>('midrange');
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    if (selectedDeck && !isCreatingNew) {
      setDeckName(selectedDeck.name);
      setSelectedCards(selectedDeck.cards);
    }
  }, [selectedDeck, isCreatingNew]);

  const autoBuildDeck = useCallback((strategy: DeckStrategy) => {
    const newDeck: CardType[] = [];
    const availableCards = [...collection];

    // Strategy-specific card selection logic
    switch (strategy) {
      case 'aggro':
        // Prioritize low-cost cards and direct damage
        availableCards.sort((a, b) => a.cost - b.cost);
        break;
      case 'control':
        // Prioritize defensive cards and removal effects
        availableCards.sort((a, b) => b.defense || 0 - (a.defense || 0));
        break;
      case 'midrange':
        // Balance of costs and effects
        availableCards.sort((a, b) => (a.cost + (a.power || 0)) - (b.cost + (b.power || 0)));
        break;
      case 'combo':
        // Prioritize cards with synergistic effects
        availableCards.sort((a, b) => b.types.length - a.types.length);
        break;
    }

    // Fill deck according to strategy
    while (newDeck.length < GAME_CONSTANTS.MIN_DECK_SIZE && availableCards.length > 0) {
      const card = availableCards.shift();
      if (card) {
        const cardCount = newDeck.filter(c => c.id === card.id).length;
        if (cardCount < GAME_CONSTANTS.MAX_CARD_COPIES) {
          newDeck.push(card);
        }
      }
    }

    setSelectedCards(newDeck);
    setDeckName(`Auto ${strategy.charAt(0).toUpperCase() + strategy.slice(1)}`);
    setShowAutoBuild(false);
  }, [collection]);

  const filteredAndSortedCollection = useMemo(() => {
    let filtered = collection.filter(card => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          card.name.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          card.types.some(type => type.toLowerCase().includes(searchLower))
        );
      }
      if (typeFilter !== 'all') {
        return card.types.includes(typeFilter);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return a.cost - b.cost;
        case 'type':
          return a.types[0].localeCompare(b.types[0]);
        default:
          return 0;
      }
    });
  }, [collection, search, typeFilter, sortBy]);

  const handleCreateNewDeck = () => {
    setIsCreatingNew(true);
    selectDeck(null);
    setDeckName('');
    setSelectedCards([]);
    setShowDeckList(false);
  };

  const handleSelectDeck = (deck: Deck) => {
    setIsCreatingNew(false);
    selectDeck(deck);
    setDeckName(deck.name);
    setSelectedCards(deck.cards);
    setShowDeckList(false);
  };

  const handleAddCard = (card: CardType) => {
    if (selectedCards.length >= GAME_CONSTANTS.MAX_DECK_SIZE) return;
    const cardCount = selectedCards.filter(c => c.id === card.id).length;
    if (cardCount >= GAME_CONSTANTS.MAX_CARD_COPIES) return;
    
    setSelectedCards(prev => [...prev, card]);
  };

  const handleRemoveCard = (index: number) => {
    setSelectedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDeck = () => {
    if (!deckName || selectedCards.length !== GAME_CONSTANTS.MIN_DECK_SIZE) return;

    const deck: Deck = {
      id: selectedDeck?.id || `deck-${Date.now()}`,
      name: deckName,
      cards: selectedCards,
    };

    saveDeck(deck);
    setIsCreatingNew(false);
  };

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const CARDS_PER_ROW = Math.floor((bounds.width - 32) / 200) || 1;
    const index = rowIndex * CARDS_PER_ROW + columnIndex;
    const card = filteredAndSortedCollection[index];

    if (!card) return null;

    const cardCount = selectedCards.filter(c => c.id === card.id).length;

    return (
      <div style={style} className="p-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
          className="relative group"
        >
          <div className="absolute top-2 right-2 bg-medieval-dark/50 rounded px-2 py-1 z-10">
            <span className="text-medieval-light">{cardCount}/2</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddCard(card)}
            className={`cursor-pointer transform-gpu ${cardCount >= 2 ? 'opacity-50' : ''}`}
          >
            <Card {...card} />
          </motion.div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medieval-dark via-medieval-primary to-medieval-dark">
      <BackButton onClick={onExit} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-medieval text-medieval-accent">Deck Builder</h1>
          <div className="flex gap-4">
            <motion.button
              onClick={() => setShowAutoBuild(true)}
              className="px-4 py-2 bg-medieval-accent text-medieval-dark rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wand2 className="w-5 h-5" />
              Auto Build
            </motion.button>
            <motion.button
              onClick={() => setShowDeckList(!showDeckList)}
              className="px-4 py-2 bg-medieval-accent text-medieval-dark rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showDeckList ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {showDeckList ? 'Hide Decks' : 'Show Decks'}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Collection */}
          <div className={`${showDeckList ? 'lg:col-span-8' : 'lg:col-span-10'}`}>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medieval-light/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full bg-medieval-light/5 text-medieval-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-medieval-accent focus:outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="bg-medieval-light/5 text-medieval-light px-4 py-2 rounded-lg focus:ring-2 focus:ring-medieval-accent focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="human">Human</option>
                <option value="nonhuman">Nonhuman</option>
                <option value="celestial">Celestial</option>
                <option value="event">Event</option>
                <option value="location">Location</option>
                <option value="object">Object</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-medieval-light/5 text-medieval-light px-4 py-2 rounded-lg focus:ring-2 focus:ring-medieval-accent focus:outline-none"
              >
                <option value="cost">Sort by Cost</option>
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>

            {/* Card Grid */}
            <div className="h-[calc(100vh-400px)]" ref={ref}>
              {bounds.width > 0 && (
                <FixedSizeGrid
                  columnCount={Math.floor((bounds.width - 32) / 200) || 1}
                  columnWidth={200}
                  height={bounds.height}
                  rowCount={Math.ceil(filteredAndSortedCollection.length / (Math.floor((bounds.width - 32) / 200) || 1))}
                  rowHeight={300}
                  width={bounds.width}
                  className="scrollbar-thin scrollbar-thumb-medieval-accent"
                >
                  {Cell}
                </FixedSizeGrid>
              )}
            </div>
          </div>

          {/* Deck List */}
          <AnimatePresence>
            {showDeckList && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:col-span-4 space-y-4"
              >
                <motion.button
                  onClick={handleCreateNewDeck}
                  className="w-full p-4 bg-medieval-accent/20 rounded-lg flex items-center justify-center gap-2 hover:bg-medieval-accent/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-6 h-6 text-medieval-accent" />
                  <span className="text-medieval-accent">Create New Deck</span>
                </motion.button>

                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-500px)] pr-2">
                  {decks.map((deck) => (
                    <motion.div
                      key={deck.id}
                      className={`p-6 rounded-lg cursor-pointer transition-all ${
                        selectedDeck?.id === deck.id
                          ? 'bg-medieval-accent/20 border-medieval-accent'
                          : 'bg-medieval-dark/20 hover:bg-medieval-dark/30'
                      } border`}
                      onClick={() => handleSelectDeck(deck)}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <ScrollText className="w-5 h-5 text-medieval-accent mr-2" />
                          <span className="text-medieval-light font-bold">{deck.name}</span>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDeck(deck.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </motion.button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {deck.cards.slice(0, 3).map((card, index) => (
                          <motion.div
                            key={`${card.id}-${index}`}
                            className="w-12 h-16 bg-medieval-light/5 rounded-lg"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: index * 5 }}
                          />
                        ))}
                        {deck.cards.length > 3 && (
                          <div className="w-12 h-16 bg-medieval-light/5 rounded-lg flex items-center justify-center">
                            <span className="text-medieval-light/50 text-sm">+{deck.cards.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current Deck Preview */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-medieval-dark/90 p-4 border-t border-medieval-accent/20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Deck Name"
                  className="bg-medieval-light/5 text-medieval-light px-4 py-2 rounded-lg focus:ring-2 focus:ring-medieval-accent focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-medieval-accent" />
                  <span className="text-medieval-light text-sm">
                    {selectedCards.length}/{GAME_CONSTANTS.MIN_DECK_SIZE} cards
                  </span>
                </div>
              </div>
              <motion.button
                onClick={handleSaveDeck}
                disabled={selectedCards.length !== GAME_CONSTANTS.MIN_DECK_SIZE || !deckName}
                className="px-6 py-2 bg-medieval-accent text-medieval-dark rounded-lg flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Save Deck
              </motion.button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-medieval-accent">
              {selectedCards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  layoutId={`deck-card-${index}`}
                  className="relative group"
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => handleRemoveCard(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full z-10 opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </motion.button>
                  <Card {...card} className="scale-75 transform-gpu" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auto Build Modal */}
      <AnimatePresence>
        {showAutoBuild && (
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
              className="bg-medieval-dark rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-medieval text-medieval-accent mb-6">Auto Build Deck</h2>
              
              <div className="space-y-4">
                {(['aggro', 'control', 'midrange', 'combo'] as DeckStrategy[]).map((strategy) => (
                  <motion.button
                    key={strategy}
                    onClick={() => autoBuildDeck(strategy)}
                    className={`w-full p-4 rounded-lg text-left transition-colors
                      ${selectedStrategy === strategy
                        ? 'bg-medieval-accent text-medieval-dark'
                        : 'bg-medieval-light/5 text-medieval-light hover:bg-medieval-light/10'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-bold capitalize mb-1">{strategy}</div>
                    <div className="text-sm opacity-80">{STRATEGY_DESCRIPTIONS[strategy]}</div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setShowAutoBuild(false)}
                className="mt-6 w-full p-3 bg-medieval-light/10 text-medieval-light rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}