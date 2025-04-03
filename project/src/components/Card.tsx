import React, { useState, useCallback, memo } from 'react';
import { CardTemplate, PLACEMENT_RULES, PlayerState } from '../types/game';
import { Clock, Coins, Sparkles, ChevronDown, ChevronUp, Shield, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

interface CardProps extends CardTemplate {
  isPlayable?: boolean;
  remainingDuration?: number;
  onClick?: () => void;
  onHover?: () => void;
  className?: string;
  isNew?: boolean;
  isDragging?: boolean;
  validSlots?: (keyof PlayerState['field'])[];
  isOpponentCard?: boolean;
  index?: number;
  totalCards?: number;
}

const Card = memo(function Card({
  id = '',
  name = '',
  year = '',
  types = [],
  description = '',
  effect = '',
  duration,
  cost = 0,
  power = 0,
  defense = 0,
  isPlayable = true,
  remainingDuration,
  onClick,
  onHover,
  className = '',
  isNew = false,
  isDragging = false,
  validSlots = [],
  isOpponentCard = false,
  index = 0,
  totalCards = 1,
}: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ scale }, api] = useSpring(() => ({ 
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isPlayable && !isOpponentCard) return;
    
    if (onClick) {
      onClick();
    }
  }, [isPlayable, onClick, isOpponentCard]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(true);
  }, []);

  const handleCloseExpanded = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'text-blue-400';
      case 'nonhuman': return 'text-green-400';
      case 'celestial': return 'text-purple-400';
      case 'event': return 'text-red-400';
      case 'location': return 'text-amber-400';
      case 'object': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  // Calculate card position in stack
  const offset = index - (totalCards - 1) / 2;
  const baseRotation = offset * 5;
  const baseTranslateY = Math.abs(offset) * 5;

  return (
    <>
      <animated.div
        style={{
          scale,
          transform: `rotate(${baseRotation}deg) translateY(${baseTranslateY}px)`,
        }}
        onMouseEnter={() => api.start({ scale: 1.05 })}
        onMouseLeave={() => api.start({ scale: 1 })}
        onClick={handleCardClick}
        className={`
          relative bg-gradient-to-br from-gray-800 to-gray-900 
          rounded-lg p-2 border-2 select-none cursor-pointer
          ${isPlayable ? 'hover:border-yellow-500/50' : 'opacity-75'}
          ${isOpponentCard ? 'border-red-500/30' : ''}
          ${isDragging ? 'border-yellow-500 shadow-lg' : 'border-gray-700'}
          transition-colors duration-300 w-[160px] h-[200px]
          transform-gpu
          ${className}
        `}
      >
        {isNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-medieval-accent/20 rounded-lg pointer-events-none"
          />
        )}

        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[10px] font-bold text-yellow-400 flex items-center gap-1 truncate pr-2">
            {name}
            {isNew && <Sparkles className="w-2 h-2 text-medieval-accent animate-pulse" />}
          </h3>
          <span className="text-[8px] text-gray-400">{year}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-1">
          {types.map((type, index) => (
            <span 
              key={index}
              className={`text-[8px] italic ${getTypeColor(type)}`}
            >
              /{type}/
            </span>
          ))}
        </div>

        <p className="text-[8px] text-gray-300 italic mb-2 line-clamp-3 leading-tight">
          "{description}"
        </p>

        <div className="absolute bottom-1 left-1 flex items-center gap-2">
          <div className="flex items-center text-yellow-500">
            <Coins className="w-2 h-2 mr-0.5" />
            <span className="text-[8px] font-bold">{cost}</span>
          </div>
          {power > 0 && (
            <div className="flex items-center text-red-500">
              <Sword className="w-2 h-2 mr-0.5" />
              <span className="text-[8px] font-bold">{power}</span>
            </div>
          )}
          {defense > 0 && (
            <div className="flex items-center text-blue-500">
              <Shield className="w-2 h-2 mr-0.5" />
              <span className="text-[8px] font-bold">{defense}</span>
            </div>
          )}
        </div>

        {duration && (
          <div className="absolute bottom-1 right-5 flex items-center text-blue-400">
            <Clock className="w-2 h-2 mr-0.5" />
            <span className="text-[8px]">{remainingDuration || duration}</span>
          </div>
        )}

        <motion.button
          className="absolute bottom-1 right-1 p-0.5 rounded-full bg-gray-700/50 hover:bg-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleExpandClick}
        >
          <ChevronDown className="w-2 h-2 text-gray-300" />
        </motion.button>

        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-medieval-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 -z-10 bg-black/20 rounded-lg transform translate-y-1 blur-sm" />
      </animated.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={handleCloseExpanded}
          >
            <motion.div
              className="bg-medieval-dark p-4 rounded-lg max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-yellow-400">{name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{year}</span>
                  <motion.button
                    onClick={handleCloseExpanded}
                    className="p-1 rounded-full hover:bg-gray-700/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronUp className="w-4 h-4 text-gray-300" />
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {types.map((type, index) => (
                  <span key={index} className={`text-xs italic ${getTypeColor(type)}`}>
                    /{type}/
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-300 italic mb-3">{description}</p>

              <div className="bg-gray-900/50 p-2 rounded-md mb-4">
                <p className="text-xs text-gray-400 leading-relaxed">{effect}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {duration && (
                    <div className="flex items-center text-blue-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{remainingDuration || duration} rounds</span>
                    </div>
                  )}
                  <div className="flex items-center text-yellow-500">
                    <Coins className="w-4 h-4 mr-1" />
                    <span className="text-sm font-bold">{cost} gold</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {power > 0 && (
                    <div className="flex items-center text-red-500">
                      <Sword className="w-4 h-4 mr-1" />
                      <span className="text-sm font-bold">{power} power</span>
                    </div>
                  )}
                  {defense > 0 && (
                    <div className="flex items-center text-blue-500">
                      <Shield className="w-4 h-4 mr-1" />
                      <span className="text-sm font-bold">{defense} defense</span>
                    </div>
                  )}
                </div>
              </div>

              {!isOpponentCard && validSlots.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Playable in: {validSlots.join(', ')}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export { Card };