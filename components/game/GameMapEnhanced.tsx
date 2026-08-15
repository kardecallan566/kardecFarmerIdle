import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
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

const GUARD_IMAGES = {
  warrior: require('@/assets/images/guard-warrior.png'),
  archer: require('@/assets/images/guard-archer.png'),
  tank: require('@/assets/images/guard-tank.png'),
};

const ENEMY_IMAGES = {
  normal: require('@/assets/images/enemy-normal.png'),
  boss: require('@/assets/images/enemy-boss.png'),
};

export function GameMapEnhanced() {
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

    lastEnemyIds.forEach(id => {
      if (!currentEnemyIds.has(id)) {
        const lastPos = lastEnemyPositionsRef.current.get(id);
        if (lastPos) {
          addDeathAnimation(lastPos.x, lastPos.y, '#FF4444');
          const coinValue = Math.floor(Math.random() * 3) + 1;
          addCoinAnimation(lastPos.x, lastPos.y, screenWidth - 40, 40, coinValue);
        }
      }
    });

    const newPositions = new Map<string, { x: number; y: number }>();
    state.enemies.forEach(enemy => {
      newPositions.set(enemy.id, { x: enemy.x, y: enemy.y });
    });
    lastEnemyPositionsRef.current = newPositions;
  }, [state.enemies, addDeathAnimation, addCoinAnimation]);

  // Trigger attack animations when guards attack
  useEffect(() => {
    state.guards.forEach(guard => {
      const nearestEnemy = state.enemies.find(enemy => {
        const dist = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
        return dist < guard.range && enemy.health > 0;
      });

      if (nearestEnemy && guard.attackCooldown <= 0) {
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

    if (dist > plantationRadius + 30 && dist < mapRadius) {
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
        plotIndex: 0,
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

  const pulseRadius = plantationRadius + Math.sin(pulse) * 3;

  // Memoize path rendering
  const pathElements = useMemo(() => {
    return paths.map((path, pathIndex) => (
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
              stroke="#D4A574"
              strokeWidth="4"
              opacity="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </G>
    ));
  }, [paths]);

  // Memoize enemy rendering
  const enemyElements = useMemo(() => {
    return state.enemies.map((enemy) => (
      <G key={enemy.id}>
        <Circle
          cx={Math.round(enemy.x) + 1}
          cy={Math.round(enemy.y) + 1}
          r={enemy.radius}
          fill="#000"
          opacity="0.15"
        />
        <Circle
          cx={Math.round(enemy.x)}
          cy={Math.round(enemy.y)}
          r={enemy.radius}
          fill={enemy.color}
          stroke="#000"
          strokeWidth="1"
          opacity={enemy.health > 0 ? 1 : 0.5}
        />
        {enemy.isBoss && (
          <Circle
            cx={Math.round(enemy.x)}
            cy={Math.round(enemy.y)}
            r={enemy.radius + 3}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            opacity="0.8"
          />
        )}
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
    ));
  }, [state.enemies]);

  // Memoize guard rendering
  const guardElements = useMemo(() => {
    return state.guards.map((guard) => (
      <G key={guard.id}>
        <Circle
          cx={Math.round(guard.x)}
          cy={Math.round(guard.y)}
          r={guard.range}
          fill="none"
          stroke={guard.color}
          strokeWidth="1"
          opacity="0.1"
        />
        <Circle
          cx={Math.round(guard.x) + 1}
          cy={Math.round(guard.y) + 1}
          r={8}
          fill="#000"
          opacity="0.2"
        />
        <Circle
          cx={Math.round(guard.x)}
          cy={Math.round(guard.y)}
          r={8}
          fill={guard.color}
          stroke="#000"
          strokeWidth="1"
        />
        <Circle
          cx={Math.round(guard.x) - 2}
          cy={Math.round(guard.y) - 2}
          r={3}
          fill="#FFF"
          opacity="0.5"
        />
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
    ));
  }, [state.guards]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <Pressable onPress={handleMapPress} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Svg
          width={screenWidth}
          height={screenHeight / 2}
          viewBox={`0 0 ${screenWidth} ${screenHeight / 2}`}
        >
          <Defs>
            <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#D4A574" stopOpacity="1" />
              <Stop offset="50%" stopColor="#C4B5A0" stopOpacity="1" />
              <Stop offset="100%" stopColor="#B8A89C" stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="plantationGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFE066" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Background */}
          <Rect width={screenWidth} height={screenHeight / 2} fill="url(#bgGradient)" />

          {/* Radial paths */}
          {pathElements}

          {/* Plantation glow */}
          <Circle
            cx={mapCenterX}
            cy={mapCenterY}
            r={plantationRadius + 15}
            fill="url(#plantationGlow)"
          />

          {/* Plantation pulse effect */}
          <Circle
            cx={mapCenterX}
            cy={mapCenterY}
            r={pulseRadius}
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            opacity="0.4"
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

          {/* Enemies */}
          {enemyElements}

          {/* Guards */}
          {guardElements}

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
