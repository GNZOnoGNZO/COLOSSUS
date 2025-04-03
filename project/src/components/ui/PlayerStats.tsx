import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sword, Shield, Star, X, Coins } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface PlayerStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerStats({ isOpen, onClose }: PlayerStatsProps) {
  const { user } = useAuthStore();

  const stats = [
    { icon: Trophy, label: 'Wins', value: user?.wins || 0 },
    { icon: Shield, label: 'Losses', value: user?.losses || 0 },
    { icon: Sword, label: 'Win Rate', value: `${user?.wins && user?.losses ? 
      Math.round((user.wins / (user.wins + user.losses)) * 100) : 0}%` },
    { icon: Star, label: 'Level', value: Math.floor((user?.experience || 0) / 1000) + 1 },
    { icon: Coins, label: 'Total Gold', value: user?.gold || 0 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-medieval-dark rounded-lg p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medieval text-medieval-accent">Player Stats</h2>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-medieval-light/10 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-medieval-light" />
              </motion.button>
            </div>

            {/* Player Info */}
            <div className="bg-medieval-light/5 rounded-lg p-4 mb-6">
              <h3 className="text-lg text-medieval-light mb-2">{user?.username}</h3>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-medieval-accent" />
                <div className="flex-1 h-2 bg-medieval-light/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-medieval-accent"
                    style={{ 
                      width: `${((user?.experience || 0) % 1000) / 10}%`
                    }}
                  />
                </div>
                <span className="text-sm text-medieval-light">
                  {(user?.experience || 0) % 1000}/1000
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-medieval-light/5 p-4 rounded-lg flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <stat.icon className="w-6 h-6 text-medieval-accent" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-medieval-light">
                      {stat.value}
                    </div>
                    <div className="text-sm text-medieval-accent">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}