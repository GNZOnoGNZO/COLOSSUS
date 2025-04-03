import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-medieval-light dark:bg-medieval-dark"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {isDarkMode ? (
        <Sun className="w-6 h-6 text-medieval-accent" />
      ) : (
        <Moon className="w-6 h-6 text-medieval-accent" />
      )}
    </motion.button>
  );
}