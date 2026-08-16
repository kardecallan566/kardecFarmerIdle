import React, { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText, Image as SvgImage, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useGame } from '@/lib/game/GameContext';
import { INITIAL_GAME_CONFIG, GUARD_CONFIGS } from '@/lib/game/types';
import { distance } from '@/lib/game/utils';
import { getMapLayout, getPlotPosition } from '@/lib/game/layout';
import { useAttackAnimations } from '@/lib/game/useAttackAnimations';
import { useDeathAnimations } from '@/lib/game/useDeathAnimations';
import { useCoinAnimations } from '@/lib/game/useCoinAnimations';
import { AttackAnimationsLayer } from './AttackAnimationsLayer';
import { DeathAnimationsLayer } from './DeathAnimationsLayer';
import { CoinAnimationsLayer } from './CoinAnimationsLayer';

const GUARD_IMAGES = {
  warrior: require('@/assets/images/guard-warrior.png'),
  archer: require('@/assets/images/guard-archer.png'),
  tank: require('@/assets/images/guard-tank.png'),
};

const ENEMY_IMAGES = {
  normal: require('@/assets/images/enemy-normal.png'),
  boss: require('@/assets/images/enemy-boss.png'),
};

const FOREST_VILLAGE_BACKGROUND = require('@/assets/images/forest-village-background.png');

export function GameMap() {
  const { state, dispatch } = useGame();
  const { width, height: windowHeight } = useWindowDimensions();
  const mapLayout = useMemo(() => getMapLayout(width, windowHeight), [width, windowHeight]);
  const [animationTick, setAnimationTick] = useState(0);
  const [plantationHit, setPlantationHit] = useState(false);
  const lastEnemyPositionsRef = React.useRef<Map<string, { x: number; y: number }>>(new Map());
  const lastDefeatedCountRef = React.useRef(state.totalEnemiesDefeated);
  const previousPlantationHealthRef = React.useRef(state.plantationHealth);

  const { animations: attackAnimations, addAttackAnimation } = useAttackAnimations();
  const { deathAnimations, addDeathAnimation } = useDeathAnimations();
  const { coinAnimations, addCoinAnimation } = useCoinAnimations();

  const mapCenterX = mapLayout.centerX;
  const mapCenterY = mapLayout.centerY;
  const plotDist = mapLayout.plotDistance;

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimationTick((tick) => (tick + 1) % 360);
    }, 50);
    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const previousHealth = previousPlantationHealthRef.current;
    if (state.plantationHealth < previousHealth) {
      setPlantationHit(true);
      const timeout = setTimeout(() => setPlantationHit(false), 850);
      previousPlantationHealthRef.current = state.plantationHealth;
      return () => clearTimeout(timeout);
    }
    previousPlantationHealthRef.current = state.plantationHealth;
  }, [state.plantationHealth]);

  const plotPositions = state.plots.map((plot) => ({
    ...getPlotPosition(plot.index, mapCenterX, mapCenterY, plotDist),
    index: plot.index,
    name: plot.name,
  }));

  useEffect(() => {
    const currentEnemyIds = new Set(state.enemies.map((enemy) => enemy.id));
    const removedPositions = Array.from(lastEnemyPositionsRef.current.entries())
      .filter(([id]) => !currentEnemyIds.has(id))
      .map(([, position]) => position);
    const defeatedSinceLastRender = Math.max(
      0,
      state.totalEnemiesDefeated - lastDefeatedCountRef.current,
    );

    removedPositions.slice(0, defeatedSinceLastRender).forEach((lastPos) => {
      addDeathAnimation(lastPos.x, lastPos.y, '#FF4444');
      const coinValue = Math.floor(Math.random() * 4) + 1;
      addCoinAnimation(lastPos.x, lastPos.y, mapLayout.width - 40, 40, coinValue);
    });

    const newPositions = new Map<string, { x: number; y: number }>();
    state.enemies.forEach((enemy) => {
      newPositions.set(enemy.id, { x: enemy.x, y: enemy.y });
    });
    lastEnemyPositionsRef.current = newPositions;
    lastDefeatedCountRef.current = state.totalEnemiesDefeated;
  }, [state.enemies, state.totalEnemiesDefeated, addDeathAnimation, addCoinAnimation, mapLayout.width]);

  useEffect(() => {
    state.guards.forEach(guard => {
      const nearestEnemy = state.enemies.find(enemy => {
        const dist = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
        return dist <= guard.range && enemy.health > 0;
      });

      if (nearestEnemy && guard.attackCooldown <= 0) {
        const isRanged = guard.type === 'archer';
        addAttackAnimation(
          guard.x,
          guard.y,
          nearestEnemy.x,
          nearestEnemy.y,
          isRanged ? 'projectile' : 'slash',
          isRanged ? '#FFD700' : '#FF6B6B',
        );
      }
    });
  }, [state.guards, state.enemies, addAttackAnimation]);

  const handlePlotPress = (plotIndex: number) => {
    const selectedPlot = state.plots.find((plot) => plot.index === plotIndex);
    if (!selectedPlot?.unlocked) return;

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

  const beaconAngle = state.sprinkler.angle;
  const beaconPulse = 1 + Math.sin(animationTick * 0.14) * 0.08;
  const beaconOpacity = 0.24 + (Math.sin(animationTick * 0.14) + 1) * 0.06;

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#F5E6D3',
      }}
    >
      <Svg
        width={mapLayout.width}
        height={mapLayout.height}
        viewBox={`0 0 ${mapLayout.width} ${mapLayout.height}`}
      >
        <Defs>
          <LinearGradient id="forestBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#183A2A" />
            <Stop offset="55%" stopColor="#315941" />
            <Stop offset="100%" stopColor="#203C2B" />
          </LinearGradient>
          <LinearGradient id="laneBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7a5530" />
            <Stop offset="100%" stopColor="#573b1f" />
          </LinearGradient>
        </Defs>

        <Rect width={mapLayout.width} height={mapLayout.height} fill="url(#forestBg)" />
        <SvgImage
          href={FOREST_VILLAGE_BACKGROUND}
          x={0}
          y={0}
          width={mapLayout.width}
          height={mapLayout.height}
          preserveAspectRatio="xMidYMid slice"
          opacity={0.62}
        />

        <Rect
          x={mapCenterX - 40}
          y={0}
          width={80}
          height={mapCenterY}
          fill="url(#laneBg)"
          rx={8}
          opacity={0.94}
        />
        <Line
          x1={mapCenterX - 39}
          y1={0}
          x2={mapCenterX - 39}
          y2={mapCenterY}
          stroke="#C9955C"
          strokeWidth="2"
          opacity={0.7}
        />
        <Line
          x1={mapCenterX + 39}
          y1={0}
          x2={mapCenterX + 39}
          y2={mapCenterY}
          stroke="#C9955C"
          strokeWidth="2"
          opacity={0.7}
        />
        <Line
          x1={mapCenterX}
          y1={10}
          x2={mapCenterX}
          y2={Math.max(10, mapCenterY - 10)}
          stroke="#E5B978"
          strokeWidth="3"
          strokeDasharray="12 14"
          opacity={0.72}
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
          const isIlluminated = plot?.isWateredThisCycle;
          const isLocked = !plot?.unlocked;

          return (
            <G key={`plot_group_${pos.index}`}>
              <Rect
                x={pos.x - 34}
                y={pos.y - 34}
                width={68}
                height={68}
                rx={14}
                fill={isLocked ? '#243D35' : isIlluminated ? '#3d6330' : '#5c3d2e'}
                stroke={isLocked ? '#78927C' : isSelected ? '#3182ce' : isIlluminated ? '#F7D774' : '#8c5e47'}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isLocked ? '5 4' : undefined}
                onPress={() => handlePlotPress(pos.index)}
              />

              {isLocked ? (
                <G>
                  <Circle cx={pos.x} cy={pos.y - 5} r={8} fill="#9BB4A0" opacity={0.9} />
                  <Path d={`M ${pos.x - 5} ${pos.y - 5} L ${pos.x - 5} ${pos.y - 1} L ${pos.x + 5} ${pos.y - 1} L ${pos.x + 5} ${pos.y - 5}`} fill="none" stroke="#243D35" strokeWidth="2" />
                  <SvgText x={pos.x} y={pos.y + 18} fontSize={8} fill="#DDEFC8" fontWeight="bold" textAnchor="middle">BLOQUEADO</SvgText>
                </G>
              ) : isIlluminated && (
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={38}
                  fill="none"
                                      stroke="#F7D774"

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
                  <Circle
                    cx={pos.x}
                    cy={pos.y - 2}
                    r={5}
                    fill="#F7C948"
                    stroke="#3A2417"
                    strokeWidth={1.5}
                  />
                  <Path
                    d={`M ${pos.x} ${pos.y + 2} C ${pos.x - 8} ${pos.y - 3}, ${pos.x - 7} ${pos.y - 10}, ${pos.x - 2} ${pos.y - 6} C ${pos.x + 3} ${pos.y - 11}, ${pos.x + 7} ${pos.y - 5}, ${pos.x} ${pos.y + 2}`}
                    fill="#78B84A"
                    stroke="#3A2417"
                    strokeWidth={1.2}
                  />
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
          r={mapLayout.guardHoldDistance}
          fill="none"
          stroke="#B8D491"
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity={0.56}
        />
        <SvgText
          x={mapCenterX}
          y={mapCenterY - mapLayout.guardHoldDistance - 8}
          fontSize={8}
          fill="#DDEFC8"
          textAnchor="middle"
          fontWeight="bold"
          opacity={0.8}
        >
          LINHA DE DEFESA
        </SvgText>

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

        <Circle
          cx={mapCenterX}
          cy={mapCenterY}
          r={38 * beaconPulse}
          fill="none"
          stroke="#FFF0A8"
          strokeWidth="2"
          opacity={beaconOpacity}
        />
        <Circle
          cx={mapCenterX}
          cy={mapCenterY}
          r={plantationHit ? 48 : 36}
          fill="none"
          stroke="#F07863"
          strokeWidth={plantationHit ? 5 : 1}
          opacity={plantationHit ? 0.95 : 0}
        />
        <Path
          d={`M ${mapCenterX} ${mapCenterY} L ${mapCenterX + Math.cos(beaconAngle - 0.18) * mapLayout.mapRadius} ${mapCenterY + Math.sin(beaconAngle - 0.18) * mapLayout.mapRadius} L ${mapCenterX + Math.cos(beaconAngle + 0.18) * mapLayout.mapRadius} ${mapCenterY + Math.sin(beaconAngle + 0.18) * mapLayout.mapRadius} Z`}
          fill="#FFF4B0"
          opacity={0.12 + beaconOpacity}
        />
        <Line
          x1={mapCenterX}
          y1={mapCenterY}
          x2={mapCenterX + Math.cos(beaconAngle) * mapLayout.mapRadius}
          y2={mapCenterY + Math.sin(beaconAngle) * mapLayout.mapRadius}
          stroke="#FFF8D0"
          strokeWidth="3"
          strokeDasharray="8 10"
          opacity={0.72}
        />
        <Circle cx={mapCenterX} cy={mapCenterY + 17} r={23} fill="#213E37" opacity={0.32} />
        <Path
          d={`M ${mapCenterX - 14} ${mapCenterY + 15} L ${mapCenterX - 10} ${mapCenterY - 12} L ${mapCenterX + 10} ${mapCenterY - 12} L ${mapCenterX + 14} ${mapCenterY + 15} Z`}
          fill="#596B67"
          stroke="#263A37"
          strokeWidth="2"
        />
        <Rect
          x={mapCenterX - 17}
          y={mapCenterY + 12}
          width={34}
          height={9}
          rx={3}
          fill="#263A37"
          stroke="#D7B35C"
          strokeWidth="2"
        />
        <Rect
          x={mapCenterX - 9}
          y={mapCenterY - 20}
          width={18}
          height={12}
          rx={3}
          fill="#F7D774"
          stroke="#5A4930"
          strokeWidth="2"
        />
        <Path
          d={`M ${mapCenterX - 13} ${mapCenterY - 20} L ${mapCenterX} ${mapCenterY - 28} L ${mapCenterX + 13} ${mapCenterY - 20} Z`}
          fill="#9E5B3C"
          stroke="#5A4930"
          strokeWidth="2"
        />
        <Circle cx={mapCenterX} cy={mapCenterY - 14} r={4} fill="#FFF8D0" opacity={0.95} />

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
            {guard.health < guard.maxHealth && (
              <G>
                <Rect
                  x={Math.round(guard.x) - 16}
                  y={Math.round(guard.y) - 23}
                  width={32}
                  height={4}
                  fill="#251C18"
                  rx={2}
                />
                <Rect
                  x={Math.round(guard.x) - 16}
                  y={Math.round(guard.y) - 23}
                  width={Math.max(0, (guard.health / guard.maxHealth) * 32)}
                  height={4}
                  fill={guard.health / guard.maxHealth <= 0.3 ? '#F07863' : '#8DCB63'}
                  rx={2}
                />
              </G>
            )}
          </G>
        ))}

        {state.enemies.map((enemy, enemyIndex) => {
          const imgSize = enemy.isBoss ? 44 : 30;
          const phase = animationTick * 0.16 + enemyIndex * 0.9;
          const bob = Math.sin(phase) * (enemy.isBoss ? 2 : 1.2);
          const scale = 1 + Math.sin(phase * 1.2) * (enemy.isBoss ? 0.035 : 0.02);
          const x = Math.round(enemy.x);
          const y = Math.round(enemy.y);
          const transform = `translate(${x} ${y + bob}) scale(${scale})`;

          return (
            <G key={enemy.id} transform={transform}>
              <Circle
                cx={1}
                cy={2}
                r={imgSize / 2}
                fill="#000"
                opacity={0.25}
              />
              <SvgImage
                href={ENEMY_IMAGES[enemy.isBoss ? 'boss' : 'normal']}
                x={-imgSize / 2}
                y={-imgSize / 2}
                width={imgSize}
                height={imgSize}
              />
              {enemy.health < enemy.maxHealth && (
                <G>
                  <Rect
                    x={-14}
                    y={-imgSize / 2 - 6}
                    width={28}
                    height={4}
                    fill="#333"
                    rx={2}
                  />
                  <Rect
                    x={-14}
                    y={-imgSize / 2 - 6}
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
          {`Farol Central • Plantação ${Math.floor(state.plantationHealth)}/${state.maxPlantationHealth}`}
        </SvgText>
      </Svg>

      <AttackAnimationsLayer animations={attackAnimations} />
      <DeathAnimationsLayer animations={deathAnimations} />
      <CoinAnimationsLayer animations={coinAnimations} />
    </View>
  );
}
