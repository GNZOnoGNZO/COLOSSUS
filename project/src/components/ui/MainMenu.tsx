import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Settings, LogOut, Trophy, User, Coins, ScrollText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ onPlay, onSettings, onProfile, onLeaderboard }: MainMenuProps) {
  const { user, signOut } = useAuthStore();

  const menuItems = [
    { icon: Sword, label: 'Play', onClick: onPlay },
    { icon: User, label: 'Profile', onClick: onProfile },
    { icon: Trophy, label: 'Leaderboard', onClick: onLeaderboard },
    { icon: Settings, label: 'Settings', onClick: onSettings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-medieval-dark via-medieval-primary to-medieval-dark p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medieval text-medieval-accent mb-4">
            Colossus Universe
          </h1>
          <div className="flex justify-center items-center gap-4 bg-medieval-dark/30 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-medieval-accent" />
              <span className="text-medieval-light">{user?.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-medieval-accent" />
              <span className="text-medieval-light">{user?.gold}</span>
            </div>
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-medieval-accent" />
              <span className="text-medieval-light">Level {Math.floor(user?.experience || 0 / 1000) + 1}</span>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              onClick={item.onClick}
              className="bg-medieval-dark/50 hover:bg-medieval-dark p-6 rounded-lg flex flex-col items-center gap-3
                border-2 border-medieval-accent/20 hover:border-medieval-accent transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <item.icon className="w-8 h-8 text-medieval-accent" />
              <span className="text-lg font-medieval text-medieval-light">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Sign Out Button */}
        <motion.button
          onClick={signOut}
          className="mt-8 w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 p-4 rounded-lg
            flex items-center justify-center gap-2 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
}