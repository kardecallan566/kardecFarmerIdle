import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { AttackAnimation } from '@/lib/game/useAttackAnimations';
import { getMapLayout } from '@/lib/game/layout';

interface AttackAnimationsLayerProps {
  animations: AttackAnimation[];
}

export function AttackAnimationsLayer({ animations }: AttackAnimationsLayerProps) {
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
          const currentX = anim.fromX + (anim.toX - anim.fromX) * progress;
          const currentY = anim.fromY + (anim.toY - anim.fromY) * progress;
          const opacity = Math.max(0, 1 - progress * 0.5);

          if (anim.type === 'projectile') {
            return (
              <G key={anim.id} opacity={opacity}>
                <Line
                  x1={anim.fromX}
                  y1={anim.fromY}
                  x2={currentX}
                  y2={currentY}
                  stroke={anim.color}
                  strokeWidth="2"
                  opacity="0.35"
                />
                <Circle
                  cx={currentX}
                  cy={currentY}
                  r={4}
                  fill={anim.color}
                  stroke="#FFF7CF"
                  strokeWidth="0.8"
                />
              </G>
            );
          }

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
        })}
      </Svg>
    </View>
  );
}
