import React, { useEffect, useState } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { useGame } from '@/lib/game/GameContext';
import { INITIAL_GAME_CONFIG } from '@/lib/game/types';
import { generateRadialPaths, getPositionOnPath, distance } from '@/lib/game/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function GameMap() {
  const { state, dispatch } = useGame();
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [pulse, setPulse] = useState(0);

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
    <Pressable onPress={handleMapPress} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

        {/* Enemies */}
        {state.enemies.map((enemy) => (
          <G key={enemy.id}>
            {/* Enemy shadow */}
            <Circle
              cx={Math.round(enemy.x) + 1}
              cy={Math.round(enemy.y) + 1}
              r={enemy.radius}
              fill="#000"
              opacity="0.2"
            />
            {/* Enemy body */}
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
          </G>
        ))}

        {/* Guards */}
        {state.guards.map((guard) => (
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
          </G>
        ))}

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
  );
}
