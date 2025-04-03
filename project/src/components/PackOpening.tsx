import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Sparkles, Coins } from 'lucide-react';
import { Card } from './Card';
import { CardTemplate } from '../types/game';
import { PackReward } from '../types/cards';
import { useSpring, animated } from 'react-spring';

interface PackOpeningProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: PackReward[];
}

export function PackOpening({ isOpen, onClose, rewards }: PackOpeningProps) {
  const [revealedRewards, setRevealedRewards] = useState<PackReward[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(-1);

  const sparkleProps = useSpring({
    from: { opacity: 0, scale: 0 },
    to: async (next) => {
      while (isRevealing) {
        await next({ opacity: 1, scale: 1.2 });
        await next({ opacity: 0.5, scale: 0.8 });
      }
    },
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    if (isOpen && rewards.length > 0) {
      setIsRevealing(true);
      setRevealedRewards([]);
      setCurrentRewardIndex(-1);

      const revealInterval = setInterval(() => {
        setCurrentRewardIndex((prev) => {
          const next = prev + 1;
          if (next >= rewards.length) {
            clearInterval(revealInterval);
            setIsRevealing(false);
            return prev;
          }
          return next;
        });
      }, 800);

      return () => clearInterval(revealInterval);
    }
  }, [isOpen, rewards]);

  useEffect(() => {
    if (currentRewardIndex >= 0 && currentRewardIndex < rewards.length) {
      setRevealedRewards((prev) => [...prev, rewards[currentRewardIndex]]);
    }
  }, [currentRewardIndex, rewards]);

  const rewardVariants = {
    hidden: { scale: 0, rotateY: 180 },
    visible: (i: number) => ({
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: i * 0.2,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-medieval-dark p-8 rounded-lg max-w-4xl w-full mx-4"
          >
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-medieval-light/10 
                hover:bg-medieval-light/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-medieval-accent" />
            </motion.button>

            <h2 className="text-2xl font-medieval text-medieval-accent mb-8 text-center">
              Opening Pack
            </h2>

            <div className="relative min-h-[400px] flex items-center justify-center">
              {isRevealing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <animated.div style={sparkleProps}>
                    <Package className="w-16 h-16 text-medieval-accent" />
                  </animated.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute"
                  >
                    <Sparkles className="w-24 h-24 text-medieval-accent opacity-50" />
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {revealedRewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={rewardVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative"
                    >
                      {reward.type === 'card' && reward.card && (
                        <>
                          <motion.div
                            className="absolute inset-0 bg-medieval-accent/20 rounded-lg"
                            animate={{
                              opacity: [0, 0.5, 0],
                            }}
                            transition={{
                              duration: 1,
                              delay: index * 0.2,
                            }}
                          />
                          <Card {...reward.card} isNew={true} />
                        </>
                      )}
                      {reward.type === 'gold' && reward.goldAmount && (
                        <motion.div
                          className="bg-medieval-dark/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 border-2 border-medieval-accent"
                          animate={{
                            borderColor: ['#DAA520', '#FFD700', '#DAA520'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <Coins className="w-12 h-12 text-medieval-accent" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-medieval-accent">
                              {reward.goldAmount}
                            </div>
                            <div className="text-sm text-medieval-light">Gold</div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}