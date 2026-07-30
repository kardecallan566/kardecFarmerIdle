import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'explosion' | 'spark' | 'dust';
}

export function AdvancedParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity
            life: p.life - 1,
            vx: p.vx * 0.98, // air resistance
          }))
          .filter((p) => p.life > 0);

        return updated;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const addExplosion = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Math.random() * 3 + 2;

      newParticles.push({
        id: `explosion_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2,
        color,
        type: 'explosion',
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  const addSpark = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;

      newParticles.push({
        id: `spark_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20,
        maxLife: 20,
        size: Math.random() * 2 + 1,
        color,
        type: 'spark',
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Svg width={screenWidth} height={screenHeight}>
        {particles.map((p) => {
          const opacity = p.life / p.maxLife;
          return (
            <Circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={opacity}
            />
          );
        })}
      </Svg>
    </View>
  );
}

export function useAdvancedParticles() {
  const ref = React.useRef<any>(null);

  return {
    addExplosion: (x: number, y: number, color: string) => {
      ref.current?.addExplosion?.(x, y, color);
    },
    addSpark: (x: number, y: number, color: string) => {
      ref.current?.addSpark?.(x, y, color);
    },
  };
}
