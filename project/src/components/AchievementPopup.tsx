import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface AchievementPopupProps {
  title: string;
  xpReward: number;
  isVisible: boolean;
  onComplete: () => void;
}

export function AchievementPopup({ title, xpReward, isVisible, onComplete }: AchievementPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-medieval-light dark:bg-medieval-dark p-4 rounded-lg shadow-lg flex items-center space-x-4"
          onAnimationComplete={onComplete}
        >
          <Trophy className="w-8 h-8 text-medieval-accent" />
          <div>
            <h3 className="font-bold text-medieval-primary dark:text-medieval-light">{title}</h3>
            <p className="text-sm text-medieval-secondary dark:text-medieval-accent">+{xpReward} XP</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}