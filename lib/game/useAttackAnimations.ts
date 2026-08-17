import { useEffect, useRef, useState, useCallback } from 'react';

export interface AttackAnimation {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  duration: number;
  type: 'projectile' | 'slash';
  color: string;
}

export function useAttackAnimations() {
  const [animations, setAnimations] = useState<AttackAnimation[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Add new attack animation
  const addAttackAnimation = useCallback((
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    type: 'projectile' | 'slash' = 'projectile',
    color: string = '#FFD700'
  ) => {
    const newAnimation: AttackAnimation = {
      id: `attack_${Date.now()}_${Math.random()}`,
      fromX,
      fromY,
      toX,
      toY,
      progress: 0,
      duration: type === 'projectile' ? 110 : 85,
      type,
      color,
    };

    setAnimations((prev) => [...prev.slice(-23), newAnimation]);
  }, []);

  // Update animation progress
  useEffect(() => {
    if (animations.length === 0) return;

    const updateAnimations = () => {
      setAnimations((prev) => {
        const updated = prev
          .map((anim) => ({
            ...anim,
            progress: Math.min(anim.progress + 16, anim.duration), // 60fps
          }))
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
  }, [animations.length]);

  return {
    animations,
    addAttackAnimation,
  };
}
