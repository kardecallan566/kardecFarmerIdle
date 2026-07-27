import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CoinAnimation } from '@/lib/game/useCoinAnimations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CoinAnimationsLayerProps {
  animations: CoinAnimation[];
}

export function CoinAnimationsLayer({ animations }: CoinAnimationsLayerProps) {
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
          const opacity = Math.max(0, 1 - progress * 0.3); // Slight fade
          const scale = 1 + progress * 0.2; // Slight grow

          return (
            <G key={anim.id} opacity={opacity}>
              {/* Coin circle */}
              <Circle
                cx={Math.round(anim.x)}
                cy={Math.round(anim.y)}
                r={6 * scale}
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="1"
              />

              {/* Coin shine */}
              <Circle
                cx={Math.round(anim.x) - 2}
                cy={Math.round(anim.y) - 2}
                r={2 * scale}
                fill="#FFF"
                opacity="0.6"
              />
            </G>
          );
        })}
      </Svg>

      {/* Coin counter floating text */}
      {animations.map((anim) => {
        const progress = anim.progress / anim.duration;
        if (progress < 0.3) return null; // Only show at end of animation

        return (
          <View
            key={`text_${anim.id}`}
            style={{
              position: 'absolute',
              left: Math.round(anim.x) - 15,
              top: Math.round(anim.y) - 20,
              opacity: Math.max(0, 1 - (progress - 0.3) / 0.7),
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFD700' }}>
              +{anim.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
