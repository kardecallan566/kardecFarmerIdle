import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { DeathAnimation } from '@/lib/game/useDeathAnimations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DeathAnimationsLayerProps {
  animations: DeathAnimation[];
}

export function DeathAnimationsLayer({ animations }: DeathAnimationsLayerProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth,
        height: screenHeight / 2,
        pointerEvents: 'none',
      }}
    >
      <Svg width={screenWidth} height={screenHeight / 2}>
        {animations.map((anim) => (
          <G key={anim.id}>
            {/* Render particles */}
            {anim.particles.map((particle) => {
              const opacity = particle.life / particle.maxLife;
              return (
                <Circle
                  key={particle.id}
                  cx={Math.round(particle.x)}
                  cy={Math.round(particle.y)}
                  r={particle.size}
                  fill={particle.color}
                  opacity={opacity}
                />
              );
            })}

            {/* Central explosion flash */}
            {anim.progress < 100 && (
              <Circle
                cx={Math.round(anim.x)}
                cy={Math.round(anim.y)}
                r={15 * (1 - anim.progress / 100)}
                fill="#FFD700"
                opacity={0.5 * (1 - anim.progress / 100)}
              />
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}
