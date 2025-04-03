import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed top-4 left-4 p-2 bg-medieval-light dark:bg-medieval-dark rounded-full 
        hover:bg-medieval-secondary dark:hover:bg-medieval-primary transition-colors z-50 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ArrowLeft className="w-6 h-6 text-medieval-primary dark:text-medieval-accent" />
    </motion.button>
  );
}