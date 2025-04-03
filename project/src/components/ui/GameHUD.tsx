import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Clock, Coins } from 'lucide-react';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  shield: number;
  gold: number;
  round: number;
  timeLeft: number;
}

export function GameHUD({
  health,
  maxHealth,
  shield,
  gold,
  round,
  timeLeft,
}: GameHUDProps) {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Health and Shield */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-medieval-dark/80 px-3 py-1 rounded-lg">
            <Heart className="w-4 h-4 text-red-500" />
            <div className="w-20 h-2 bg-medieval-light/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(health / maxHealth) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <span className="text-sm text-medieval-light">{health}</span>
          </div>
          {shield > 0 && (
            <div className="flex items-center gap-2 bg-medieval-dark/80 px-3 py-1 rounded-lg">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-medieval-light">{shield}</span>
            </div>
          )}
        </div>

        {/* Round and Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-medieval-dark/80 px-3 py-1 rounded-lg">
            <Clock className="w-4 h-4 text-medieval-accent" />
            <span className="text-sm text-medieval-light">Round {round}</span>
          </div>
          <div className="flex items-center gap-2 bg-medieval-dark/80 px-3 py-1 rounded-lg">
            <Coins className="w-4 h-4 text-medieval-accent" />
            <span className="text-sm text-medieval-light">{gold}</span>
          </div>
        </div>
      </div>
    </div>
  );
}