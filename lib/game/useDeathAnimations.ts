import { useEffect, useRef, useState, useCallback } from 'react';

export interface DeathAnimation {
  id: string;
  x: number;
  y: number;
  progress: number;
  duration: number;
  particles: Particle[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function useDeathAnimations() {
  const [deathAnimations, setDeathAnimations] = useState<DeathAnimation[]>([]);
  const animationFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add new death animation
  const addDeathAnimation = useCallback((x: number, y: number, color: string = '#FF4444') => {
    const particles: Particle[] = [];

    // Create explosion particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 2;

      particles.push({
        id: `particle_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500,
        maxLife: 500,
        size: 4 + Math.random() * 4,
        color,
      });
    }

    const newAnimation: DeathAnimation = {
      id: `death_${Date.now()}`,
      x,
      y,
      progress: 0,
      duration: 500,
      particles,
    };

    setDeathAnimations((prev) => [...prev, newAnimation]);
  }, []);

  // Update animation progress
  useEffect(() => {
    if (deathAnimations.length === 0) return;

    const updateAnimations = () => {
      setDeathAnimations((prev) => {
        const updated = prev
          .map((anim) => {
            const newProgress = anim.progress + 16;
            const updatedParticles = anim.particles
              .map((p) => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.1, // gravity
                life: Math.max(0, p.life - 16),
              }))
              .filter((p) => p.life > 0);

            return {
              ...anim,
              progress: newProgress,
              particles: updatedParticles,
            };
          })
          .filter((anim) => anim.progress < anim.duration || anim.particles.length > 0);

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
  }, [deathAnimations.length]);

  return {
    deathAnimations,
    addDeathAnimation,
  };
}
