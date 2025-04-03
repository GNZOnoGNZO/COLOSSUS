import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Card } from './Card';
import { CardTemplate } from '../types/game';
import { allCards } from '../data/cards';
import { useCardStore } from '../store/cardStore';
import { BackButton } from './BackButton';
import { FixedSizeGrid } from 'react-window';
import useMeasure from 'react-use-measure';

interface AllCardsProps {
  onExit: () => void;
}

export function AllCards({ onExit }: AllCardsProps) {
  const { isCardOwned } = useCardStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [ref, bounds] = useMeasure();

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          card.name.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          card.types.some(type => type.toLowerCase().includes(searchLower))
        );
      }
      if (filter !== 'all') {
        return card.types.includes(filter);
      }
      return true;
    });
  }, [search, filter]);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const CARDS_PER_ROW = Math.floor((bounds.width - 32) / 200) || 1;
    const index = rowIndex * CARDS_PER_ROW + columnIndex;
    const card = filteredCards[index];

    if (!card) return null;

    const owned = isCardOwned(card.id);
    
    return (
      <div style={style} className="p-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative group h-full"
        >
          <Card
            {...card}
            className={`${owned ? '' : 'opacity-50 grayscale'} transform-gpu`}
          />
          {!owned && (
            <div className="absolute inset-0 flex items-center justify-center bg-medieval-dark/80 rounded-lg">
              <span className="text-medieval-accent font-medieval">Not Available</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medieval-dark via-medieval-primary to-medieval-dark p-8">
      <BackButton onClick={onExit} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-medieval text-medieval-accent mb-4">Card Collection</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medieval-light/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cards..."
                className="w-full bg-medieval-light/5 text-medieval-light pl-10 pr-4 py-2 rounded-lg border border-medieval-light/10 focus:border-medieval-accent focus:outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-medieval-light/5 text-medieval-light px-4 py-2 rounded-lg border border-medieval-light/10 focus:border-medieval-accent focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="human">Human</option>
              <option value="nonhuman">Nonhuman</option>
              <option value="celestial">Celestial</option>
              <option value="event">Event</option>
              <option value="location">Location</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-medieval-light">
              Showing {filteredCards.length} cards
            </span>
            <span className="text-medieval-accent">
              {filteredCards.filter(card => isCardOwned(card.id)).length} owned
            </span>
          </div>
        </div>

        <div className="h-[calc(100vh-250px)]" ref={ref}>
          {bounds.width > 0 && (
            <FixedSizeGrid
              columnCount={Math.floor((bounds.width - 32) / 200) || 1}
              columnWidth={200}
              height={bounds.height}
              rowCount={Math.ceil(filteredCards.length / (Math.floor((bounds.width - 32) / 200) || 1))}
              rowHeight={300}
              width={bounds.width}
              className="scrollbar-thin scrollbar-thumb-medieval-accent scrollbar-track-medieval-dark"
            >
              {Cell}
            </FixedSizeGrid>
          )}
        </div>
      </div>
    </div>
  );
}