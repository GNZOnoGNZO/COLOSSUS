import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Crown, Skull, ChevronRight } from 'lucide-react';

interface CoinFlipProps {
  isFlipping: boolean;
  onCall: (call: 'heads' | 'tails') => void;
  result: 'heads' | 'tails' | null;
  onComplete: () => void;
  timeLeft: number;
}

export function CoinFlip({ isFlipping, onCall, result, onComplete, timeLeft }: CoinFlipProps) {
  const [hasCalledCoin, setHasCalledCoin] = useState(false);
  const [callAttempts, setCallAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const { rotation, y } = useSpring({
    from: { rotation: 0, y: 0 },
    to: async (next) => {
      if (result) {
        await next({ y: -100, rotation: 720, config: { tension: 150, friction: 10 } });
        await next({ y: 0, rotation: 1440 + (result === 'heads' ? 0 : 180), config: { tension: 150, friction: 20 } });
        setShowResult(true);
      }
    },
    config: { mass: 1, tension: 180, friction: 12 },
  });

  useEffect(() => {
    if (showResult && result) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResult, result]);

  const handleCoinCall = (call: 'heads' | 'tails') => {
    setHasCalledCoin(true);
    onCall(call);
    setCallAttempts(prev => prev + 1);
  };

  const handleContinue = () => {
    setShowResult(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isFlipping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <div className="text-center max-w-md w-full mx-auto px-4">
            {!hasCalledCoin ? (
              <div className="bg-medieval-dark p-8 rounded-lg">
                <h2 className="text-2xl font-medieval text-medieval-accent mb-6">
                  Choose Your Side
                </h2>
                <div className="flex justify-center gap-8 mb-6">
                  <motion.button
                    onClick={() => handleCoinCall('heads')}
                    className="relative group w-32 h-32 bg-medieval-accent text-medieval-dark rounded-full overflow-hidden
                      flex flex-col items-center justify-center hover:bg-medieval-primary hover:text-medieval-light
                      shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05, rotate: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Crown className="w-16 h-16" />
                    <span className="text-sm mt-1 font-medieval">Heads</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleCoinCall('tails')}
                    className="relative group w-32 h-32 bg-medieval-accent text-medieval-dark rounded-full overflow-hidden
                      flex flex-col items-center justify-center hover:bg-medieval-primary hover:text-medieval-light
                      shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05, rotate: -10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Skull className="w-16 h-16" />
                    <span className="text-sm mt-1 font-medieval">Tails</span>
                  </motion.button>
                </div>
                <motion.div 
                  className="text-medieval-light bg-medieval-dark/50 px-4 py-2 rounded-lg text-xl"
                  animate={{ 
                    scale: timeLeft <= 3 ? [1, 1.2, 1] : 1,
                    color: timeLeft <= 3 ? ['#F5DEB3', '#DAA520', '#F5DEB3'] : '#F5DEB3'
                  }}
                  transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
                >
                  Choose in {timeLeft} seconds
                </motion.div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative h-64">
                  <animated.div
                    style={{
                      transform: rotation.to(r => `rotateX(${r}deg)`).to(r => `translateY(${y.get()}px) rotateX(${r}deg)`),
                      transformStyle: 'preserve-3d',
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
                  >
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-medieval-accent rounded-full shadow-xl flex flex-col items-center justify-center backface-hidden">
                        <Crown className="w-24 h-24 text-medieval-dark" />
                        <span className="text-medieval-dark font-medieval mt-2">Heads</span>
                      </div>
                      <div className="absolute inset-0 bg-medieval-accent rounded-full shadow-xl flex flex-col items-center justify-center backface-hidden rotate-y-180">
                        <Skull className="w-24 h-24 text-medieval-dark" />
                        <span className="text-medieval-dark font-medieval mt-2">Tails</span>
                      </div>
                    </div>
                  </animated.div>
                </div>

                {showResult && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-medieval-dark/80 p-6 rounded-lg"
                  >
                    <div className="flex items-center justify-center gap-4 mb-4">
                      {result === 'heads' ? (
                        <Crown className="w-12 h-12 text-medieval-accent" />
                      ) : (
                        <Skull className="w-12 h-12 text-medieval-accent" />
                      )}
                      <span className="text-2xl font-medieval text-medieval-accent capitalize">
                        {result}!
                      </span>
                    </div>
                    <div className="text-lg text-medieval-light mb-6">
                      {callAttempts >= 3 
                        ? 'Random player selected after 3 failed calls'
                        : `${result === 'heads' ? 'You' : 'Opponent'} will go first!`
                      }
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}