import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Card } from './Card';
import { CardTemplate } from '../types/game';
import { motion } from 'framer-motion';
import AutoSizer from 'react-virtualized-auto-sizer';

interface CardGridProps {
  cards: CardTemplate[];
  onCardClick: (card: CardTemplate) => void;
  totalCount: number;
}

export function CardGrid({ cards, onCardClick, totalCount }: CardGridProps) {
  const COLUMN_COUNT = 4;
  const CARD_HEIGHT = 250;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    if (index >= cards.length) return null;

    const card = cards[index];

    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card
          {...card}
          onClick={() => onCardClick(card)}
          index={index}
          totalCards={cards.length}
        />
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4 px-4">
        <div className="flex justify-between items-center">
          <h3 className="text-medieval-light text-lg">Collection</h3>
          <span className="text-medieval-accent">
            {cards.length} / {totalCount} Cards
          </span>
        </div>
        <div className="h-1 bg-medieval-light/10 rounded-full mt-2">
          <div
            className="h-full bg-medieval-accent rounded-full transition-all duration-300"
            style={{ width: `${(cards.length / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="h-[calc(100vh-400px)]">
        <AutoSizer>
          {({ height, width }) => (
            <Grid
              columnCount={COLUMN_COUNT}
              columnWidth={width / COLUMN_COUNT}
              height={height}
              rowCount={Math.ceil(cards.length / COLUMN_COUNT)}
              rowHeight={CARD_HEIGHT}
              width={width}
            >
              {Cell}
            </Grid>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}