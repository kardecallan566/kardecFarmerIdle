import { useEffect, useRef, useState, useCallback } from 'react';

export interface CoinAnimation {
  id: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  duration: number;
  value: number;
}

export function useCoinAnimations() {
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Add new coin animation
  const addCoinAnimation = useCallback((
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    value: number = 1
  ) => {
    const newAnimation: CoinAnimation = {
      id: `coin_${Date.now()}_${Math.random()}`,
      x: startX,
      y: startY,
      startX,
      startY,
      targetX,
      targetY,
      progress: 0,
      duration: 600, // 600ms animation
      value,
    };

    setCoinAnimations((prev) => [...prev.slice(-23), newAnimation]);
  }, []);

  // Update animation progress
  useEffect(() => {
    if (coinAnimations.length === 0) return;

    const updateAnimations = () => {
      setCoinAnimations((prev) => {
        const updated = prev
          .map((anim) => {
            const newProgress = Math.min(anim.progress + 16, anim.duration);
            const progress = newProgress / anim.duration;

            // Ease out cubic for smooth deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            return {
              ...anim,
              progress: newProgress,
              x: anim.startX + (anim.targetX - anim.startX) * easeProgress,
              y: anim.startY + (anim.targetY - anim.startY) * easeProgress,
            };
          })
          .filter((anim) => anim.progress < anim.duration);

        if (updated.length === 0) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }

        return updated;
      });
    };

    const scheduleNextFrame = () => {
      updateAnimations();
      animationFrameRef.current = requestAnimationFrame(scheduleNextFrame);
    };
    animationFrameRef.current = requestAnimationFrame(scheduleNextFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [coinAnimations.length]);

  return {
    coinAnimations,
    addCoinAnimation,
  };
}
