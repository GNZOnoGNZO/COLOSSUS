import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Settings, Home, Volume2, Volume1, VolumeX } from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onExit: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export function PauseMenu({
  isOpen,
  onResume,
  onRestart,
  onSettings,
  onExit,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}: PauseMenuProps) {
  const menuItems = [
    { icon: Play, label: 'Resume', onClick: onResume },
    { icon: RotateCcw, label: 'Restart', onClick: onRestart },
    { icon: Settings, label: 'Settings', onClick: onSettings },
    { icon: Home, label: 'Exit to Menu', onClick: onExit },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-medieval-dark rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-medieval text-medieval-accent text-center mb-6">
              Game Paused
            </h2>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full bg-medieval-light/5 hover:bg-medieval-light/10 p-4 rounded-lg
                    flex items-center gap-3 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="w-5 h-5 text-medieval-accent" />
                  <span className="text-medieval-light">{item.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <motion.button
                onClick={onToggleSound}
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  soundEnabled ? 'bg-medieval-accent text-medieval-dark' : 'bg-medieval-light/10 text-medieval-light'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>
              <motion.button
                onClick={onToggleMusic}
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  musicEnabled ? 'bg-medieval-accent text-medieval-dark' : 'bg-medieval-light/10 text-medieval-light'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {musicEnabled ? <Volume1 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}