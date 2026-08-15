import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { DeathAnimation } from '@/lib/game/useDeathAnimations';
import { getMapLayout } from '@/lib/game/layout';

interface DeathAnimationsLayerProps {
  animations: DeathAnimation[];
}

export function DeathAnimationsLayer({ animations }: DeathAnimationsLayerProps) {
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
        {animations.map((anim) => (
          <G key={anim.id}>
            {anim.particles.map((particle) => (
              <Circle
                key={particle.id}
                cx={Math.round(particle.x)}
                cy={Math.round(particle.y)}
                r={particle.size}
                fill={particle.color}
                opacity={particle.life / particle.maxLife}
              />
            ))}
            {anim.progress < 100 && (
              <Circle
                cx={Math.round(anim.x)}
                cy={Math.round(anim.y)}
                r={15 * (1 - anim.progress / 100)}
                fill="#FFD45A"
                opacity={0.5 * (1 - anim.progress / 100)}
              />
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}
