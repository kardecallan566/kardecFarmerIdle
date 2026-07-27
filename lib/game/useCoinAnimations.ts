import { useEffect, useRef, useState } from 'react';

export interface CoinAnimation {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  duration: number;
  value: number;
}

export function useCoinAnimations() {
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([]);
  const animationFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add new coin animation
  const addCoinAnimation = (
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
      targetX,
      targetY,
      progress: 0,
      duration: 600, // 600ms animation
      value,
    };

    setCoinAnimations((prev) => [...prev, newAnimation]);
  };

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
              x: anim.x + (anim.targetX - anim.x) * easeProgress,
              y: anim.y + (anim.targetY - anim.y) * easeProgress,
            };
          })
          .filter((anim) => anim.progress < anim.duration);

        if (updated.length === 0) {
          if (animationFrameRef.current) {
            clearInterval(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }

        return updated;
      });
    };

    animationFrameRef.current = setInterval(updateAnimations, 16);

    return () => {
      if (animationFrameRef.current) {
        clearInterval(animationFrameRef.current);
      }
    };
  }, [coinAnimations.length]);

  return {
    coinAnimations,
    addCoinAnimation,
  };
}
