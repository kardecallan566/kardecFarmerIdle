import React, { useEffect, useState, useCallback } from 'react';
import { View, Dimensions, Pressable, Image } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { useGame } from '@/lib/game/GameContext';
import { INITIAL_GAME_CONFIG } from '@/lib/game/types';
import { generateRadialPaths, getPositionOnPath, distance } from '@/lib/game/utils';
import { useAttackAnimations } from '@/lib/game/useAttackAnimations';
import { useDeathAnimations } from '@/lib/game/useDeathAnimations';
import { useCoinAnimations } from '@/lib/game/useCoinAnimations';
import { AttackAnimationsLayer } from './AttackAnimationsLayer';
import { DeathAnimationsLayer } from './DeathAnimationsLayer';
import { CoinAnimationsLayer } from './CoinAnimationsLayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Image mapping for guards and enemies
const GUARD_IMAGES = {
  warrior: require('@/assets/images/guard-warrior.png'),
  archer: require('@/assets/images/guard-archer.png'),
  tank: require('@/assets/images/guard-tank.png'),
};

const ENEMY_IMAGES = {
  normal: require('@/assets/images/enemy-normal.png'),
  boss: require('@/assets/images/enemy-boss.png'),
};

export function GameMap() {
  const { state, dispatch } = useGame();
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [pulse, setPulse] = useState(0);
  const lastEnemyPositionsRef = React.useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const { animations: attackAnimations, addAttackAnimation } = useAttackAnimations();
  const { deathAnimations, addDeathAnimation } = useDeathAnimations();
  const { coinAnimations, addCoinAnimation } = useCoinAnimations();

  const mapCenterX = screenWidth / 2;
  const mapCenterY = screenHeight / 2 - 100;
  const mapRadius = INITIAL_GAME_CONFIG.mapRadius;
  const plantationRadius = INITIAL_GAME_CONFIG.plantationRadius;
  const pathCount = INITIAL_GAME_CONFIG.pathCount;

  // Generate paths on mount
  useEffect(() => {
    const generatedPaths = generateRadialPaths(
      mapCenterX,
      mapCenterY,
      pathCount,
      mapRadius
    );
    setPaths(generatedPaths);
  }, []);

  // Pulse animation for plantation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(pulseInterval);
  }, []);

  // Detect enemy deaths and trigger animations
  useEffect(() => {
    const currentEnemyIds = new Set(state.enemies.map(e => e.id));
    const lastEnemyIds = new Set(lastEnemyPositionsRef.current.keys());

    // Check for dead enemies
    lastEnemyIds.forEach(id => {
      if (!currentEnemyIds.has(id)) {
        const lastPos = lastEnemyPositionsRef.current.get(id);
        if (lastPos) {
          // Trigger death animation
          addDeathAnimation(lastPos.x, lastPos.y, '#FF4444');
          
          // Trigger coin animation (coins fly to top-right corner)
          const coinValue = Math.floor(Math.random() * 3) + 1;
          addCoinAnimation(lastPos.x, lastPos.y, screenWidth - 40, 40, coinValue);
        }
      }
    });

    // Update last positions
    const newPositions = new Map<string, { x: number; y: number }>();
    state.enemies.forEach(enemy => {
      newPositions.set(enemy.id, { x: enemy.x, y: enemy.y });
    });
    lastEnemyPositionsRef.current = newPositions;
  }, [state.enemies, addDeathAnimation, addCoinAnimation]);

  // Trigger attack animations when guards attack
  useEffect(() => {
    state.guards.forEach(guard => {
      // Find nearest enemy in range
      const nearestEnemy = state.enemies.find(enemy => {
        const dist = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
        return dist < guard.range && enemy.health > 0;
      });

      if (nearestEnemy && guard.attackCooldown <= 0) {
        // Trigger attack animation
        const color = guard.type === 'archer' ? '#FFD700' : '#FF6B6B';
        addAttackAnimation(guard.x, guard.y, nearestEnemy.x, nearestEnemy.y, 'projectile', color);
      }
    });
  }, [state.guards, state.enemies, addAttackAnimation]);

  const handleMapPress = (event: any) => {
    if (!state.placingMode || state.selectedCardIndex === null) return;

    const { locationX, locationY } = event.nativeEvent;
    const dist = distance(
      { x: mapCenterX, y: mapCenterY },
      { x: locationX, y: locationY }
    );

    // Check if position is valid (near paths, outside plantation)
    if (dist > plantationRadius + 30 && dist < mapRadius) {
      // Valid position - dispatch guard placement
      const cardIndex = state.selectedCardIndex;
      const guardTypes = ['warrior', 'archer', 'tank'] as const;
      const guardType = guardTypes[cardIndex] as 'warrior' | 'archer' | 'tank';
      const guardConfigs = {
        warrior: { health: 50, damage: 15, range: 80, attackSpeed: 1.0 },
        archer: { health: 30, damage: 10, range: 150, attackSpeed: 1.5 },
        tank: { health: 100, damage: 5, range: 60, attackSpeed: 0.5 },
      };
      const guardConfig = guardConfigs[guardType];

      const newGuard = {
        id: `guard_${Date.now()}`,
        x: locationX,
        y: locationY,
        type: guardType,
        health: guardConfig.health,
        maxHealth: guardConfig.health,
        damage: guardConfig.damage,
        range: guardConfig.range,
        attackSpeed: guardConfig.attackSpeed,
        attackCooldown: 0,
        color: (['#4169E1', '#32CD32', '#A9A9A9'] as const)[cardIndex],
      };

      dispatch({ type: 'ADD_GUARD', guard: newGuard });
      dispatch({ type: 'DESELECT_CARD' });
    }
  };

  // Calculate plantation pulse radius
  const pulseRadius = plantationRadius + Math.sin(pulse) * 3;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <Pressable onPress={handleMapPress} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Svg
          width={screenWidth}
          height={screenHeight / 2}
          viewBox={`0 0 ${screenWidth} ${screenHeight / 2}`}
        >
          {/* Background */}
          <Rect width={screenWidth} height={screenHeight / 2} fill="#E8D5C4" />

          {/* Radial paths */}
          {paths.map((path, pathIndex) => (
            <G key={`path_${pathIndex}`}>
              {path.slice(0, -1).map((point, i: number) => {
                const nextPoint = path[i + 1] || { x: 0, y: 0 };
                return (
                  <Line
                    key={`line_${pathIndex}_${i}`}
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke="#C4B5A0"
                    strokeWidth="3"
                    opacity="0.5"
                  />
                );
              })}
            </G>
          ))}

          {/* Plantation pulse effect */}
          <Circle
            cx={mapCenterX}
            cy={mapCenterY}
            r={pulseRadius}
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Plantation (center) */}
          <Circle
            cx={mapCenterX}
            cy={mapCenterY}
            r={plantationRadius}
            fill="#FFD700"
            stroke="#2D5016"
            strokeWidth="2"
          />

          {/* Enemies with images */}
          {state.enemies.map((enemy) => {
            const imageSource = enemy.isBoss ? ENEMY_IMAGES.boss : ENEMY_IMAGES.normal;
            return (
              <G key={enemy.id}>
                {/* Enemy shadow */}
                <Circle
                  cx={Math.round(enemy.x) + 1}
                  cy={Math.round(enemy.y) + 1}
                  r={enemy.radius}
                  fill="#000"
                  opacity="0.2"
                />
                {/* Enemy body - using circle as placeholder for image */}
                <Circle
                  cx={Math.round(enemy.x)}
                  cy={Math.round(enemy.y)}
                  r={enemy.radius}
                  fill={enemy.color}
                  stroke="#000"
                  strokeWidth="1"
                  opacity={enemy.health > 0 ? 1 : 0.5}
                />
                {/* Boss indicator */}
                {enemy.isBoss && (
                  <Circle
                    cx={Math.round(enemy.x)}
                    cy={Math.round(enemy.y)}
                    r={enemy.radius + 3}
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2"
                  />
                )}
                {/* Health bar */}
                {enemy.health < enemy.maxHealth && (
                  <G>
                    <Rect
                      x={Math.round(enemy.x) - 15}
                      y={Math.round(enemy.y) - enemy.radius - 8}
                      width={30}
                      height={4}
                      fill="#333"
                      rx={2}
                    />
                    <Rect
                      x={Math.round(enemy.x) - 15}
                      y={Math.round(enemy.y) - enemy.radius - 8}
                      width={(enemy.health / enemy.maxHealth) * 30}
                      height={4}
                      fill="#FF4444"
                      rx={2}
                    />
                  </G>
                )}
              </G>
            );
          })}

          {/* Guards with images */}
          {state.guards.map((guard) => {
            const imageSource = GUARD_IMAGES[guard.type];
            return (
              <G key={guard.id}>
                {/* Range indicator (faint) */}
                <Circle
                  cx={Math.round(guard.x)}
                  cy={Math.round(guard.y)}
                  r={guard.range}
                  fill="none"
                  stroke={guard.color}
                  strokeWidth="1"
                  opacity={0.15}
                />
                {/* Guard shadow */}
                <Circle
                  cx={Math.round(guard.x) + 1}
                  cy={Math.round(guard.y) + 1}
                  r={8}
                  fill="#000"
                  opacity="0.2"
                />
                {/* Guard body */}
                <Circle
                  cx={Math.round(guard.x)}
                  cy={Math.round(guard.y)}
                  r={8}
                  fill={guard.color}
                  stroke="#000"
                  strokeWidth="1"
                />
                {/* Guard highlight */}
                <Circle
                  cx={Math.round(guard.x) - 2}
                  cy={Math.round(guard.y) - 2}
                  r={3}
                  fill="#FFF"
                  opacity="0.4"
                />
                {/* Health bar */}
                {guard.health < guard.maxHealth && (
                  <G>
                    <Rect
                      x={Math.round(guard.x) - 12}
                      y={Math.round(guard.y) - 15}
                      width={24}
                      height={3}
                      fill="#333"
                      rx={1.5}
                    />
                    <Rect
                      x={Math.round(guard.x) - 12}
                      y={Math.round(guard.y) - 15}
                      width={(guard.health / guard.maxHealth) * 24}
                      height={3}
                      fill="#00FF00"
                      rx={1.5}
                    />
                  </G>
                )}
              </G>
            );
          })}

          {/* Plantation health text */}
          <SvgText
            x={mapCenterX}
            y={mapCenterY + plantationRadius + 25}
            fontSize={14}
            fill="#1A1A1A"
            textAnchor="middle"
            fontWeight="bold"
          >
            {`${Math.floor(state.plantationHealth)}/${state.maxPlantationHealth}`}
          </SvgText>
        </Svg>
      </Pressable>

      {/* Animation layers */}
      <AttackAnimationsLayer animations={attackAnimations} />
      <DeathAnimationsLayer animations={deathAnimations} />
      <CoinAnimationsLayer animations={coinAnimations} />
    </View>
  );
}
