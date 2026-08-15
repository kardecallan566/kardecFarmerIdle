import React, { useEffect, useState } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText, Image as SvgImage, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useGame } from '@/lib/game/GameContext';
import { INITIAL_GAME_CONFIG, GUARD_CONFIGS } from '@/lib/game/types';
import { distance } from '@/lib/game/utils';
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

export function GameMap() {
  const { state, dispatch } = useGame();
  const lastEnemyPositionsRef = React.useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const { animations: attackAnimations, addAttackAnimation } = useAttackAnimations();
  const { deathAnimations, addDeathAnimation } = useDeathAnimations();
  const { coinAnimations, addCoinAnimation } = useCoinAnimations();

  const mapCenterX = screenWidth / 2;
  const mapCenterY = screenHeight / 2 - 80;
  const plotDist = 80;

  const plotPositions = [
    { index: 0, name: 'Quadrante Leste', x: mapCenterX + plotDist, y: mapCenterY },
    { index: 1, name: 'Quadrante Sul', x: mapCenterX, y: mapCenterY + plotDist },
    { index: 2, name: 'Quadrante Oeste', x: mapCenterX - plotDist, y: mapCenterY },
    { index: 3, name: 'Quadrante Norte', x: mapCenterX, y: mapCenterY - plotDist },
  ];

  useEffect(() => {
    const currentEnemyIds = new Set(state.enemies.map(e => e.id));
    const lastEnemyIds = new Set(lastEnemyPositionsRef.current.keys());

    lastEnemyIds.forEach(id => {
      if (!currentEnemyIds.has(id)) {
        const lastPos = lastEnemyPositionsRef.current.get(id);
        if (lastPos) {
          addDeathAnimation(lastPos.x, lastPos.y, '#FF4444');
          const coinValue = Math.floor(Math.random() * 4) + 1;
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

  useEffect(() => {
    state.guards.forEach(guard => {
      const nearestEnemy = state.enemies.find(enemy => {
        const dist = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
        return dist <= guard.range && enemy.health > 0;
      });

      if (nearestEnemy && guard.attackCooldown <= 0) {
        const color = guard.type === 'archer' ? '#FFD700' : '#FF6B6B';
        addAttackAnimation(guard.x, guard.y, nearestEnemy.x, nearestEnemy.y, 'projectile', color);
      }
    });
  }, [state.guards, state.enemies, addAttackAnimation]);

  const handlePlotPress = (plotIndex: number) => {
    if (state.selectedCardIndex !== null) {
      const cropTypes = ['warrior', 'archer', 'tank'] as const;
      const cropType = cropTypes[state.selectedCardIndex];
      const config = GUARD_CONFIGS[cropType];

      if (state.coins >= config.cost) {
        dispatch({ type: 'SUBTRACT_COINS', amount: config.cost });
        dispatch({ type: 'PLANT_CROP', plotIndex, cropType });
      }
    } else {
      dispatch({ type: 'SELECT_PLOT', plotIndex });
    }
  };

  const sprinklerArmLen = 35;
  const nozzleX = mapCenterX + Math.cos(state.sprinkler.angle) * sprinklerArmLen;
  const nozzleY = mapCenterY + Math.sin(state.sprinkler.angle) * sprinklerArmLen;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <Svg
        width={screenWidth}
        height={screenHeight / 2 + 40}
        viewBox={`0 0 ${screenWidth} ${screenHeight / 2 + 40}`}
      >
        <Defs>
          <LinearGradient id="farmBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#e2d2b4" />
            <Stop offset="100%" stopColor="#c8b48c" />
          </LinearGradient>
          <LinearGradient id="laneBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7a5530" />
            <Stop offset="100%" stopColor="#573b1f" />
          </LinearGradient>
        </Defs>

        <Rect width={screenWidth} height={screenHeight / 2 + 40} fill="url(#farmBg)" />

        <Rect
          x={mapCenterX - 30}
          y={0}
          width={60}
          height={mapCenterY}
          fill="url(#laneBg)"
          rx={6}
          opacity={0.85}
        />
        {[0.15, 0.4, 0.65, 0.85].map((pct, idx) => (
          <Path
            key={`arrow_${idx}`}
            d={`M ${mapCenterX - 12} ${mapCenterY * pct} L ${mapCenterX} ${mapCenterY * pct + 12} L ${mapCenterX + 12} ${mapCenterY * pct}`}
            stroke="#d4a373"
            strokeWidth="3"
            fill="none"
            opacity={0.6}
          />
        ))}

        {plotPositions.map((pos) => {
          const plot = state.plots.find((p) => p.index === pos.index);
          const isSelected = state.selectedPlotIndex === pos.index;
          const isWatered = plot?.isWateredThisCycle;

          return (
            <G key={`plot_group_${pos.index}`}>
              <Rect
                x={pos.x - 34}
                y={pos.y - 34}
                width={68}
                height={68}
                rx={14}
                fill={isWatered ? '#3d6330' : '#5c3d2e'}
                stroke={isSelected ? '#3182ce' : isWatered ? '#63b3ed' : '#8c5e47'}
                strokeWidth={isSelected ? 3 : 2}
                onPress={() => handlePlotPress(pos.index)}
              />

              {isWatered && (
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={38}
                  fill="none"
                  stroke="#63b3ed"
                  strokeWidth="2"
                  opacity={0.8}
                />
              )}

              {plot?.cropType ? (
                <G onPress={() => handlePlotPress(pos.index)}>
                  <SvgImage
                    href={GUARD_IMAGES[plot.cropType]}
                    x={pos.x - 18}
                    y={pos.y - 20}
                    width={36}
                    height={36}
                  />
                  <SvgText
                    x={pos.x}
                    y={pos.y + 24}
                    fontSize={9}
                    fill="#ffffff"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {GUARD_CONFIGS[plot.cropType].name}
                  </SvgText>
                </G>
              ) : (
                <G onPress={() => handlePlotPress(pos.index)}>
                  <SvgText
                    x={pos.x}
                    y={pos.y - 4}
                    fontSize={18}
                    fill="#d4a373"
                    textAnchor="middle"
                  >
                    🌱
                  </SvgText>
                  <SvgText
                    x={pos.x}
                    y={pos.y + 16}
                    fontSize={9}
                    fill="#ebd6b0"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Plantar
                  </SvgText>
                </G>
              )}
            </G>
          );
        })}

        <Circle
          cx={mapCenterX}
          cy={mapCenterY}
          r={INITIAL_GAME_CONFIG.plantationRadius + 6}
          fill="#3182ce"
          stroke="#ebf8ff"
          strokeWidth="3"
        />
        <Circle
          cx={mapCenterX}
          cy={mapCenterY}
          r={INITIAL_GAME_CONFIG.plantationRadius}
          fill="#2b6cb0"
        />

        <Path
          d={`M ${mapCenterX} ${mapCenterY} L ${mapCenterX + Math.cos(state.sprinkler.angle - 0.25) * 110} ${mapCenterY + Math.sin(state.sprinkler.angle - 0.25) * 110} L ${mapCenterX + Math.cos(state.sprinkler.angle + 0.25) * 110} ${mapCenterY + Math.sin(state.sprinkler.angle + 0.25) * 110} Z`}
          fill="#90cdf4"
          opacity={0.35}
        />

        <Line
          x1={mapCenterX}
          y1={mapCenterY}
          x2={nozzleX}
          y2={nozzleY}
          stroke="#ebf8ff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx={nozzleX} cy={nozzleY} r={6} fill="#63b3ed" stroke="#ffffff" strokeWidth="2" />

        <SvgText
          x={mapCenterX}
          y={mapCenterY + 5}
          fontSize={16}
          textAnchor="middle"
        >
          💧
        </SvgText>

        {state.guards.map((guard) => (
          <G key={guard.id}>
            <Circle
              cx={Math.round(guard.x)}
              cy={Math.round(guard.y)}
              r={guard.range}
              fill="none"
              stroke={guard.color}
              strokeWidth="1"
              opacity={0.12}
            />
            <Circle
              cx={Math.round(guard.x) + 1}
              cy={Math.round(guard.y) + 2}
              r={12}
              fill="#000"
              opacity={0.25}
            />
            <SvgImage
              href={GUARD_IMAGES[guard.type]}
              x={Math.round(guard.x) - 16}
              y={Math.round(guard.y) - 16}
              width={32}
              height={32}
            />
          </G>
        ))}

        {state.enemies.map((enemy) => {
          const imgSize = enemy.isBoss ? 44 : 30;
          return (
            <G key={enemy.id}>
              <Circle
                cx={Math.round(enemy.x) + 1}
                cy={Math.round(enemy.y) + 2}
                r={imgSize / 2}
                fill="#000"
                opacity={0.25}
              />
              <SvgImage
                href={ENEMY_IMAGES[enemy.isBoss ? 'boss' : 'normal']}
                x={Math.round(enemy.x) - imgSize / 2}
                y={Math.round(enemy.y) - imgSize / 2}
                width={imgSize}
                height={imgSize}
              />
              {enemy.health < enemy.maxHealth && (
                <G>
                  <Rect
                    x={Math.round(enemy.x) - 14}
                    y={Math.round(enemy.y) - imgSize / 2 - 6}
                    width={28}
                    height={4}
                    fill="#333"
                    rx={2}
                  />
                  <Rect
                    x={Math.round(enemy.x) - 14}
                    y={Math.round(enemy.y) - imgSize / 2 - 6}
                    width={(enemy.health / enemy.maxHealth) * 28}
                    height={4}
                    fill="#FF4444"
                    rx={2}
                  />
                </G>
              )}
            </G>
          );
        })}

        <SvgText
          x={mapCenterX}
          y={mapCenterY + INITIAL_GAME_CONFIG.plantationRadius + 22}
          fontSize={13}
          fill="#1A1A1A"
          textAnchor="middle"
          fontWeight="bold"
        >
          {`💧 ${Math.floor(state.plantationHealth)}/${state.maxPlantationHealth}`}
        </SvgText>
      </Svg>

      <AttackAnimationsLayer animations={attackAnimations} />
      <DeathAnimationsLayer animations={deathAnimations} />
      <CoinAnimationsLayer animations={coinAnimations} />
    </View>
  );
}
