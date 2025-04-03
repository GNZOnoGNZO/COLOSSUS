import React from 'react';
import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

export function LoadingScreen({ progress, message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-medieval-dark flex items-center justify-center">
      <div className="max-w-sm w-full px-4">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sword className="w-12 h-12 text-medieval-accent" />
          </motion.div>
          <h1 className="text-2xl font-medieval text-medieval-accent mb-2">
            Colossus Universe
          </h1>
          <p className="text-medieval-light/70">{message}</p>
        </div>

        <div className="relative">
          <div className="h-2 bg-medieval-light/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-medieval-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              background: [
                'linear-gradient(90deg, rgba(218,165,32,0) 0%, rgba(218,165,32,0.2) 50%, rgba(218,165,32,0) 100%)',
                'linear-gradient(90deg, rgba(218,165,32,0) 100%, rgba(218,165,32,0.2) 150%, rgba(218,165,32,0) 200%)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}