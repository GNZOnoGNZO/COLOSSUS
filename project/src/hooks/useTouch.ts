import { useState, useCallback } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  isDragging: boolean;
}

export function useTouch() {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    isDragging: false,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      isDragging: true,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;

    return { deltaX, deltaY };
  }, [touchState]);

  const handleTouchEnd = useCallback(() => {
    setTouchState({
      startX: 0,
      startY: 0,
      isDragging: false,
    });
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging: touchState.isDragging,
  };
}