import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated } from 'react-spring';

interface BattleLogProps {
  messages: string[];
  onSendEmoji: (emoji: string) => void;
}

const EMOJIS = ['👍', '👎', '😄', '😢', '😡', '🎉', '⚔️', '🛡️', '💰', '🎲'];

export function BattleLog({ messages, onSendEmoji }: BattleLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { height } = useSpring({
    height: isExpanded ? 300 : 40,
    config: { tension: 200, friction: 20 },
  });

  useEffect(() => {
    if (!isExpanded) {
      setUnreadCount(prev => prev + 1);
    } else {
      setUnreadCount(0);
    }
  }, [messages]);

  useEffect(() => {
    if (isExpanded && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  return (
    <animated.div
      style={{ height }}
      className="fixed bottom-4 right-4 w-80 bg-medieval-dark rounded-lg shadow-lg overflow-hidden z-50"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 bg-medieval-primary cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-medieval-light" />
          <span className="text-medieval-light font-medieval">Battle Log</span>
          {!isExpanded && unreadCount > 0 && (
            <span className="bg-medieval-accent text-medieval-dark px-2 py-0.5 rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-medieval-light" />
        ) : (
          <ChevronUp className="w-5 h-5 text-medieval-light" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-[calc(100%-40px)]"
          >
            {/* Messages */}
            <div 
              ref={logRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-medieval-accent"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-medieval-light/5 p-2 rounded text-medieval-light text-sm"
                >
                  {message}
                </motion.div>
              ))}
            </div>

            {/* Emoji Bar */}
            <div className="p-2 border-t border-medieval-light/10">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-medieval-accent">
                  {EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      onClick={() => onSendEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center bg-medieval-light/5 rounded hover:bg-medieval-light/10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </animated.div>
  );
}