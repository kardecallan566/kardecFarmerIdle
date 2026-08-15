import { useWindowDimensions, View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CoinAnimation } from '@/lib/game/useCoinAnimations';
import { getMapLayout } from '@/lib/game/layout';

interface CoinAnimationsLayerProps {
  animations: CoinAnimation[];
}

export function CoinAnimationsLayer({ animations }: CoinAnimationsLayerProps) {
  const { width, height } = useWindowDimensions();
  const mapLayout = getMapLayout(width, height);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: mapLayout.width,
        height: mapLayout.height,
        pointerEvents: 'none',
      }}
    >
      <Svg width={mapLayout.width} height={mapLayout.height}>
        {animations.map((anim) => {
          const progress = Math.min(1, anim.progress / anim.duration);
          const opacity = Math.max(0, 1 - progress * 0.3);
          const scale = 1 + progress * 0.2;

          return (
            <G key={anim.id} opacity={opacity}>
              <Circle
                cx={Math.round(anim.x)}
                cy={Math.round(anim.y)}
                r={6 * scale}
                fill="#FFD700"
                stroke="#8B5A1D"
                strokeWidth="1"
              />
              <Circle
                cx={Math.round(anim.x) - 2}
                cy={Math.round(anim.y) - 2}
                r={2 * scale}
                fill="#FFF8D1"
                opacity="0.8"
              />
            </G>
          );
        })}
      </Svg>

      {animations.map((anim) => {
        const progress = Math.min(1, anim.progress / anim.duration);
        if (progress < 0.3) return null;

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
