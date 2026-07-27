import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { AttackAnimation } from '@/lib/game/useAttackAnimations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AttackAnimationsLayerProps {
  animations: AttackAnimation[];
}

export function AttackAnimationsLayer({ animations }: AttackAnimationsLayerProps) {
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
        {animations.map((anim) => {
          const progress = anim.progress / anim.duration;
          const currentX = anim.fromX + (anim.toX - anim.fromX) * progress;
          const currentY = anim.fromY + (anim.toY - anim.fromY) * progress;
          const opacity = Math.max(0, 1 - progress * 0.5); // Fade out

          if (anim.type === 'projectile') {
            return (
              <G key={anim.id} opacity={opacity}>
                {/* Projectile trail */}
                <Line
                  x1={anim.fromX}
                  y1={anim.fromY}
                  x2={currentX}
                  y2={currentY}
                  stroke={anim.color}
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* Projectile circle */}
                <Circle
                  cx={currentX}
                  cy={currentY}
                  r={4}
                  fill={anim.color}
                  stroke="#FFF"
                  strokeWidth="0.5"
                />
              </G>
            );
          } else if (anim.type === 'slash') {
            // Slash animation
            const angle = Math.atan2(anim.toY - anim.fromY, anim.toX - anim.fromX);
            const slashLength = 30;
            const slashX1 = currentX - Math.cos(angle) * slashLength;
            const slashY1 = currentY - Math.sin(angle) * slashLength;
            const slashX2 = currentX + Math.cos(angle) * slashLength;
            const slashY2 = currentY + Math.sin(angle) * slashLength;

            return (
              <G key={anim.id} opacity={opacity}>
                <Line
                  x1={slashX1}
                  y1={slashY1}
                  x2={slashX2}
                  y2={slashY2}
                  stroke={anim.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </G>
            );
          }

          return null;
        })}
      </Svg>
    </View>
  );
}
