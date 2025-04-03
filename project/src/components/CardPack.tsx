import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import { useAchievementStore } from '../store/achievementStore';
import { useCardStore } from '../store/cardStore';
import { PackOpening } from './PackOpening';
import { CardTemplate } from '../types/game';
import { allCards } from '../data/cards';

export function CardPack() {
  const [isOpening, setIsOpening] = useState(false);
  const [currentPackCards, setCurrentPackCards] = useState<CardTemplate[]>([]);
  const { cardPacks, useCardPack } = useAchievementStore();
  const { addToCollection } = useCardStore();

  const generatePackCards = useCallback(() => {
    const packCards: CardTemplate[] = [];
    const rarityWeights = {
      common: 0.6,
      uncommon: 0.3,
      rare: 0.08,
      legendary: 0.02,
    };

    for (let i = 0; i < 5; i++) {
      const roll = Math.random();
      let cardPool: CardTemplate[];

      if (roll < rarityWeights.legendary) {
        cardPool = allCards.filter(card => card.types.includes('celestial'));
      } else if (roll < rarityWeights.rare) {
        cardPool = allCards.filter(card => 
          card.types.includes('nonhuman') || 
          card.types.includes('event')
        );
      } else if (roll < rarityWeights.uncommon) {
        cardPool = allCards.filter(card => 
          card.types.includes('human') || 
          card.types.includes('object')
        );
      } else {
        cardPool = allCards.filter(card => 
          !card.types.includes('celestial') && 
          !card.types.includes('nonhuman')
        );
      }

      const randomIndex = Math.floor(Math.random() * cardPool.length);
      packCards.push(cardPool[randomIndex]);
    }

    return packCards;
  }, []);

  const handleOpenPack = useCallback(() => {
    if (cardPacks > 0) {
      const newCards = generatePackCards();
      setCurrentPackCards(newCards);
      setIsOpening(true);
      useCardPack();
      addToCollection(newCards);
    }
  }, [cardPacks, generatePackCards, useCardPack, addToCollection]);

  const handleClosePackOpening = useCallback(() => {
    setIsOpening(false);
    setCurrentPackCards([]);
  }, []);

  return (
    <>
      <motion.div 
        className="fixed bottom-4 left-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={handleOpenPack}
          disabled={cardPacks === 0}
          className="relative p-4 bg-medieval-light dark:bg-medieval-dark rounded-lg disabled:opacity-50 
            hover:bg-medieval-secondary dark:hover:bg-medieval-primary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Package className="w-6 h-6 text-medieval-accent" />
          <motion.div 
            className="absolute -top-2 -right-2 bg-medieval-accent rounded-full w-6 h-6 
              flex items-center justify-center text-medieval-dark font-bold text-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {cardPacks}
          </motion.div>
        </motion.button>
      </motion.div>

      <PackOpening
        isOpen={isOpening}
        onClose={handleClosePackOpening}
        packCards={currentPackCards}
      />
    </>
  );
}