import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

interface TurnTimerProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
}

export function TurnTimer({ duration, onTimeout, isActive }: TurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeout, isActive]);

  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2">
      <Timer className="w-5 h-5 text-yellow-500" />
      <motion.div
        className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden"
        initial={false}
      >
        <motion.div
          className="h-full bg-yellow-500"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / duration) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </motion.div>
      <span className="text-yellow-500 font-mono w-8">{timeLeft}s</span>
    </div>
  );
}