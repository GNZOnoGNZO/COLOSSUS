import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coins, Package, Play, X, LayoutGrid } from 'lucide-react';
import { BackButton } from './BackButton';
import { Card } from './Card';
import { PackOpening } from './PackOpening';
import { useAchievementStore } from '../store/achievementStore';
import { useAdStore } from '../store/adStore';
import { useGoldStore } from '../store/goldStore';
import { CardTemplate } from '../types/game';
import { allCards } from '../data/cards';
import { PackReward } from '../types/cards';

interface ShopProps {
  onExit: () => void;
}

const CARD_PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'A basic pack containing 3 random cards and a chance for gold',
    price: 100,
    cardCount: 3,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    description: 'An exclusive pack with 3 cards, guaranteed rare, and better gold chances',
    price: 250,
    cardCount: 3,
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    description: 'Contains 3 cards with guaranteed legendary and highest gold chances',
    price: 500,
    cardCount: 3,
  }
];

const GOLD_POUCH_CHANCES = {
  starter: {
    chance: 0.3, // 30% chance
    amounts: [10, 15, 20, 25],
    weights: [0.4, 0.3, 0.2, 0.1],
  },
  premium: {
    chance: 0.5, // 50% chance
    amounts: [15, 20, 25, 30, 35],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1],
  },
  legendary: {
    chance: 0.7, // 70% chance
    amounts: [20, 25, 30, 35, 40, 45, 50],
    weights: [0.25, 0.2, 0.15, 0.15, 0.1, 0.1, 0.05],
  },
};

type ShopTab = 'packs' | 'collection';

export function Shop({ onExit }: ShopProps) {
  const { addCardPack } = useAchievementStore();
  const { adsWatchedToday, watchAd } = useAdStore();
  const { outGameGold, updateOutGameGold } = useGoldStore();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<ShopTab>('packs');
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [currentPackRewards, setCurrentPackRewards] = useState<PackReward[]>([]);

  const generateGoldPouch = (packId: string): number | null => {
    const config = GOLD_POUCH_CHANCES[packId as keyof typeof GOLD_POUCH_CHANCES];
    if (!config || Math.random() > config.chance) return null;

    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < config.weights.length; i++) {
      cumulative += config.weights[i];
      if (roll <= cumulative) {
        return config.amounts[i];
      }
    }
    return config.amounts[0];
  };

  const generatePackRewards = useCallback((packId: string): PackReward[] => {
    const pack = CARD_PACKS.find(p => p.id === packId);
    if (!pack) return [];

    const rewards: PackReward[] = [];
    const cardPool = [...allCards];

    // Generate cards
    if (packId === 'legendary') {
      const legendaryCards = cardPool.filter(card => card.types.includes('celestial'));
      if (legendaryCards.length > 0) {
        const randomLegendary = legendaryCards[Math.floor(Math.random() * legendaryCards.length)];
        rewards.push({ type: 'card', card: randomLegendary });
      }
    } else if (packId === 'premium') {
      const rareCards = cardPool.filter(card => 
        card.types.includes('nonhuman') || card.types.includes('event')
      );
      if (rareCards.length > 0) {
        const randomRare = rareCards[Math.floor(Math.random() * rareCards.length)];
        rewards.push({ type: 'card', card: randomRare });
      }
    }

    // Fill remaining card slots
    while (rewards.filter(r => r.type === 'card').length < pack.cardCount) {
      const randomIndex = Math.floor(Math.random() * cardPool.length);
      rewards.push({ type: 'card', card: cardPool[randomIndex] });
    }

    // Add gold pouch if lucky
    const goldAmount = generateGoldPouch(packId);
    if (goldAmount !== null) {
      rewards.push({ type: 'gold', goldAmount });
    }

    return rewards;
  }, []);

  const handlePurchase = useCallback((packId: string) => {
    const pack = CARD_PACKS.find(p => p.id === packId);
    if (pack && outGameGold >= pack.price) {
      const rewards = generatePackRewards(packId);
      setCurrentPackRewards(rewards);
      setIsOpeningPack(true);
      updateOutGameGold(-pack.price);

      // Add gold from pouches
      const totalGold = rewards
        .filter(r => r.type === 'gold')
        .reduce((sum, r) => sum + (r.goldAmount || 0), 0);
      if (totalGold > 0) {
        updateOutGameGold(totalGold);
      }

      addCardPack();
    }
  }, [outGameGold, updateOutGameGold, addCardPack, generatePackRewards]);

  const handleWatchAd = () => {
    if (watchAd()) {
      setIsWatchingAd(true);
      setAdTimer(5);
      
      const timer = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsWatchingAd(false);
            updateOutGameGold(20);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medieval-light via-medieval-secondary to-medieval-light dark:from-medieval-dark dark:via-medieval-primary dark:to-medieval-dark p-8">
      <BackButton onClick={onExit} />
      
      <AnimatePresence>
        {isWatchingAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="bg-medieval-dark p-8 rounded-lg text-center">
              <h3 className="text-2xl font-medieval text-medieval-accent mb-4">Watching Ad</h3>
              <div className="text-6xl font-bold text-medieval-light mb-4">{adTimer}</div>
              <p className="text-medieval-accent">Please wait to receive your reward</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medieval text-medieval-primary dark:text-medieval-light">
            Card Shop
          </h1>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleWatchAd}
              disabled={adsWatchedToday >= 5 || isWatchingAd}
              className="px-4 py-2 bg-medieval-accent text-medieval-dark rounded-lg 
                hover:bg-medieval-primary transition-colors disabled:opacity-50 
                disabled:cursor-not-allowed flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Ad ({adsWatchedToday}/5)
            </motion.button>
            <div className="flex items-center bg-medieval-light/10 dark:bg-medieval-dark/10 p-3 rounded-lg">
              <Coins className="w-6 h-6 text-medieval-accent mr-2" />
              <span className="text-medieval-primary dark:text-medieval-light font-bold">
                {outGameGold} Gold
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <motion.button
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'packs'
                ? 'bg-medieval-accent text-medieval-dark'
                : 'bg-medieval-dark/20 text-medieval-light'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Package className="w-4 h-4" />
            Card Packs
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('collection')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'collection'
                ? 'bg-medieval-accent text-medieval-dark'
                : 'bg-medieval-dark/20 text-medieval-light'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LayoutGrid className="w-4 h-4" />
            Collection
          </motion.button>
        </div>

        {activeTab === 'packs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CARD_PACKS.map((pack) => (
              <motion.div
                key={pack.id}
                className="bg-medieval-light/10 dark:bg-medieval-dark/10 rounded-lg p-6 border border-medieval-primary/30"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medieval text-medieval-primary dark:text-medieval-light">
                    {pack.name}
                  </h3>
                  <Package className="w-8 h-8 text-medieval-accent" />
                </div>
                
                <p className="text-medieval-secondary dark:text-medieval-accent mb-6">
                  {pack.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Coins className="w-5 h-5 text-medieval-accent mr-2" />
                    <span className="text-medieval-primary dark:text-medieval-light font-bold">
                      {pack.price}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={() => handlePurchase(pack.id)}
                    disabled={outGameGold < pack.price}
                    className="px-4 py-2 bg-medieval-accent text-medieval-dark rounded-lg 
                      hover:bg-medieval-primary transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <PackOpening
        isOpen={isOpeningPack}
        onClose={() => {
          setIsOpeningPack(false);
          setCurrentPackRewards([]);
        }}
        rewards={currentPackRewards}
      />
    </div>
  );
}