import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragStartEvent, DragOverEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Card } from './Card';
import { Shield, Heart, Coins, Timer, ScrollText, Layers, Archive, Clock } from 'lucide-react';
import { PlayerState, CardTemplate, GAME_CONSTANTS } from '../types/game';
import { CoinFlip } from './CoinFlip';
import { TurnTimer } from './TurnTimer';
import { BackButton } from './BackButton';
import { BattleLog } from './BattleLog';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useGoldStore } from '../store/goldStore';
import { useChatStore } from '../store/chatStore';
import { useTouch } from '../hooks/useTouch';

interface GameBoardProps {
  onExit: () => void;
}

function GameBoard({ onExit }: GameBoardProps) {
  const { gameState, playCard, endTurn, setFirstPlayer, handleCoinCall } = useGameStore();
  const { inGameGold, updateInGameGold } = useGoldStore();
  const { messages, addLogMessage, addEmojiMessage } = useChatStore();
  const [isFlipping, setIsFlipping] = useState(true);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [draggedCard, setDraggedCard] = useState<CardTemplate | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeckPreview, setShowDeckPreview] = useState(false);
  const [showDiscardPreview, setShowDiscardPreview] = useState(false);
  const [hasPlayedCard, setHasPlayedCard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouch();
  const [botPlayedCard, setBotPlayedCard] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Bot logic
  useEffect(() => {
    if (!gameState?.winner && gameState?.activePlayer === 'player2' && !isFlipping && !botPlayedCard) {
      // Add delay to simulate bot thinking
      const botDelay = setTimeout(() => {
        const botPlayer = gameState.players.player2;
        
        // Basic bot strategy
        if (botPlayer.hand.length > 0) {
          // Sort cards by cost descending to play strongest cards first
          const playableCards = [...botPlayer.hand].sort((a, b) => b.cost - a.cost);
          
          for (const card of playableCards) {
            // Find valid slot for card
            const validSlot = card.validSlots?.[0];
            if (validSlot && !botPlayer.field[validSlot]) {
              playCard(card, validSlot);
              setBotPlayedCard(true);
              break;
            }
          }
        }
        
        // End bot turn after playing with delay
        setTimeout(() => {
          endTurn();
          setBotPlayedCard(false);
          setTurnCount(prev => prev + 1);
        }, 1000);
      }, 1500);

      return () => clearTimeout(botDelay);
    }
  }, [gameState?.activePlayer, gameState?.winner, isFlipping, playCard, endTurn, botPlayedCard]);

  useEffect(() => {
    if (gameState?.combatLog) {
      const lastMessage = gameState.combatLog[gameState.combatLog.length - 1];
      if (lastMessage) {
        addLogMessage(lastMessage);
      }
    }
  }, [gameState?.combatLog, addLogMessage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFlipping && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isFlipping, timeLeft]);

  const handleSendEmoji = useCallback((emoji: string) => {
    addEmojiMessage(emoji);
  }, [addEmojiMessage]);

  const handleCoinCallAttempt = (call: 'heads' | 'tails') => {
    const success = handleCoinCall(call);
    if (success) {
      setCoinResult(call);
    }
  };

  const handleCoinFlipComplete = () => {
    setIsFlipping(false);
    if (coinResult) {
      setFirstPlayer(coinResult === 'heads' ? 'player1' : 'player2');
    }
  };

  const handleCardClick = useCallback((card: CardTemplate, slot: keyof PlayerState['field']) => {
    try {
      setError(null);
      if (gameState?.activePlayer === 'player1' && inGameGold >= card.cost) {
        if (!card.validSlots?.includes(slot)) {
          throw new Error(`This card cannot be played in the ${slot} slot`);
        }

        if (gameState.players.player1.field[slot]) {
          throw new Error("This slot is already occupied");
        }

        updateInGameGold(-card.cost);
        playCard(card, slot);
        setHasPlayedCard(true);
      } else if (gameState?.activePlayer !== 'player1') {
        throw new Error("It's not your turn");
      } else {
        throw new Error("Not enough gold to play this card");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play card');
      setTimeout(() => setError(null), 3000);
    }
  }, [gameState?.activePlayer, gameState?.players, inGameGold, updateInGameGold, playCard]);

  const handleEndTurn = useCallback(() => {
    if (gameState?.activePlayer === 'player1') {
      endTurn();
      setHasPlayedCard(false);
      setTurnCount(prev => prev + 1);
    }
  }, [gameState?.activePlayer, endTurn]);

  const handleTurnTimeout = useCallback(() => {
    if (gameState?.activePlayer === 'player1') {
      endTurn();
      setHasPlayedCard(false);
      setTurnCount(prev => prev + 1);
    }
  }, [gameState?.activePlayer, endTurn]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (gameState?.activePlayer !== 'player1') {
      setError("It's not your turn");
      return;
    }
    
    const card = event.active.data.current?.card as CardTemplate;
    if (card) {
      setDraggedCard(card);
      setError(null);
    }
  }, [gameState?.activePlayer]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string;
    setActiveDropZone(overId);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCard(null);
    setActiveDropZone(null);

    if (over && active.data.current) {
      try {
        const card = active.data.current.card as CardTemplate;
        const slot = over.id as keyof PlayerState['field'];

        if (!card.validSlots?.includes(slot)) {
          throw new Error(`This card cannot be played in the ${slot} slot`);
        }

        if (gameState?.players.player1.field[slot]) {
          throw new Error("This slot is already occupied");
        }

        if (inGameGold < card.cost) {
          throw new Error("Not enough gold to play this card");
        }

        updateInGameGold(-card.cost);
        playCard(card, slot);
        setHasPlayedCard(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to play card');
        setTimeout(() => setError(null), 3000);
      }
    }
  }, [inGameGold, updateInGameGold, playCard, gameState?.players]);

  const renderDeckPile = (player: PlayerState, isOpponent = false) => (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
      <motion.div
        className="relative w-24 h-32 bg-medieval-dark rounded-lg border-2 border-medieval-accent/30 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onHoverStart={() => !isOpponent && setShowDeckPreview(true)}
        onHoverEnd={() => setShowDeckPreview(false)}
      >
        <Layers className="w-8 h-8 text-medieval-accent/50" />
        <div className="absolute bottom-1 right-1 bg-medieval-accent/20 rounded-full w-6 h-6 flex items-center justify-center text-xs text-medieval-light">
          {player.deck.length}
        </div>
      </motion.div>
      <motion.div
        className="relative w-24 h-32 bg-medieval-dark rounded-lg border-2 border-medieval-primary/30 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onHoverStart={() => !isOpponent && setShowDiscardPreview(true)}
        onHoverEnd={() => setShowDiscardPreview(false)}
      >
        <Archive className="w-8 h-8 text-medieval-primary/50" />
        <div className="absolute bottom-1 right-1 bg-medieval-primary/20 rounded-full w-6 h-6 flex items-center justify-center text-xs text-medieval-light">
          {player.removedCards.length}
        </div>
      </motion.div>
    </div>
  );

  const renderCardSlot = (slot: keyof PlayerState['field'], label: string, player: PlayerState, isOpponent = false) => {
    const { setNodeRef } = useDroppable({
      id: slot,
      data: { accepts: slot }
    });

    const card = player.field[slot];
    const isValidDrop = draggedCard ? draggedCard.validSlots?.includes(slot) : false;
    const isActive = activeDropZone === slot && isValidDrop;

    return (
      <motion.div
        key={slot}
        ref={!isOpponent ? setNodeRef : undefined}
        className={`
          relative bg-medieval-dark/30 rounded-lg border-2 
          ${isActive ? 'border-medieval-accent bg-medieval-dark/50' : 'border-medieval-primary/30'} 
          transition-all duration-200 min-h-[120px]
          ${draggedCard && isValidDrop ? 'hover:border-medieval-accent hover:bg-medieval-dark/50' : ''}
        `}
        animate={{
          scale: isActive ? 1.02 : 1,
          borderColor: isActive ? 'rgb(218, 165, 32)' : 'rgba(139, 69, 19, 0.3)'
        }}
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-medieval-light/70 whitespace-nowrap">
          {label}
        </div>
        {card && (
          <div className={`relative ${isOpponent ? 'transform rotate-180' : ''}`}>
            <Card
              {...card}
              className="scale-75"
              isOpponentCard={isOpponent}
              onClick={() => !isOpponent && handleCardClick(card, slot)}
            />
            {card.duration && (
              <div className="absolute -top-2 -right-2 bg-medieval-dark rounded-full px-2 py-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-medieval-accent" />
                <span className="text-xs text-medieval-light">
                  {card.remainingDuration || card.duration}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  if (!gameState || !gameState.players) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-medieval-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.activePlayer] || {
    health: GAME_CONSTANTS.STARTING_HEALTH,
    hand: [],
    field: {
      humanNonhuman: null,
      celestialLocation: null,
      eventItem: null,
    },
    deck: [],
    removedCards: [],
  };

  const opponent = gameState.players[gameState.activePlayer === 'player1' ? 'player2' : 'player1'] || {
    health: GAME_CONSTANTS.STARTING_HEALTH,
    hand: [],
    field: {
      humanNonhuman: null,
      celestialLocation: null,
      eventItem: null,
    },
    deck: [],
    removedCards: [],
  };

  const currentRound = Math.floor(turnCount / 2) + 1;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-medieval-light via-medieval-secondary to-medieval-light dark:from-medieval-dark dark:via-medieval-primary dark:to-medieval-dark p-2">
        <div className="h-full flex flex-col">
          <div className="h-12 flex items-center justify-between px-4 bg-medieval-dark/30 rounded-lg mb-2">
            <BackButton onClick={onExit} />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-medieval-dark/50 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-medieval-accent" />
                <span className="text-sm text-medieval-light">Round {currentRound}</span>
              </div>
              <TurnTimer
                duration={30}
                onTimeout={handleTurnTimeout}
                isActive={!isFlipping && !gameState.winner && gameState.activePlayer === 'player1'}
              />
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-medieval-light">
                {opponent.health}/{GAME_CONSTANTS.STARTING_HEALTH}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-rows-[1fr_auto_1fr] gap-2">
            <div className="relative grid grid-cols-3 gap-4 p-4">
              {renderCardSlot('humanNonhuman', 'Human/Nonhuman', opponent, true)}
              {renderCardSlot('celestialLocation', 'Celestial/Location', opponent, true)}
              {renderCardSlot('eventItem', 'Event/Item', opponent, true)}
              {renderDeckPile(opponent, true)}
            </div>

            <div className="flex justify-center items-center">
              <motion.button
                onClick={handleEndTurn}
                disabled={gameState.activePlayer !== 'player1'}
                className={`
                  px-6 py-2 rounded-lg flex items-center gap-2
                  ${gameState.activePlayer === 'player1'
                    ? 'bg-medieval-accent text-medieval-dark hover:bg-medieval-primary'
                    : 'bg-medieval-dark/50 text-medieval-light/50 cursor-not-allowed'}
                `}
                whileHover={gameState.activePlayer === 'player1' ? { scale: 1.05 } : {}}
                whileTap={gameState.activePlayer === 'player1' ? { scale: 0.95 } : {}}
              >
                <Timer className="w-4 h-4" />
                End Turn
              </motion.button>
            </div>

            <div className="relative grid grid-cols-3 gap-4 p-4">
              {renderCardSlot('humanNonhuman', 'Human/Nonhuman', currentPlayer)}
              {renderCardSlot('celestialLocation', 'Celestial/Location', currentPlayer)}
              {renderCardSlot('eventItem', 'Event/Item', currentPlayer)}
              {renderDeckPile(currentPlayer)}
            </div>
          </div>

          <div className="h-32 bg-medieval-dark/30 rounded-lg p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-medieval-light">
                    {currentPlayer.health}/{GAME_CONSTANTS.STARTING_HEALTH}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-medieval-accent" />
                  <span className="text-sm text-medieval-light">{inGameGold}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-medieval-light">
                  {currentPlayer.hand.length}/{GAME_CONSTANTS.MAX_HAND_SIZE}
                </span>
                <Layers className="w-4 h-4 text-medieval-accent" />
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {currentPlayer.hand.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  className="relative"
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full z-10 flex items-center gap-1
                    ${inGameGold >= card.cost ? 'bg-medieval-accent' : 'bg-red-500'}`}
                  >
                    <Coins className="w-3 h-3 text-medieval-dark" />
                    <span className="text-xs font-bold text-medieval-dark">{card.cost}</span>
                  </div>
                  <Card
                    {...card}
                    isPlayable={inGameGold >= card.cost && gameState.activePlayer === 'player1'}
                    onClick={() => handleCardClick(card, 'humanNonhuman')}
                    className="scale-75"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <CoinFlip
            isFlipping={isFlipping}
            onCall={handleCoinCallAttempt}
            result={coinResult}
            onComplete={handleCoinFlipComplete}
            timeLeft={timeLeft}
          />

          <BattleLog 
            messages={messages.map(m => m.type === 'emoji' ? m.content : m.content)}
            onSendEmoji={handleSendEmoji}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-50"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DndContext>
  );
}

export default GameBoard;