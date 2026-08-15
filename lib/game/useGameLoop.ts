import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useGame } from './GameContext';
import {
  Enemy,
  Guard,
  INITIAL_GAME_CONFIG,
  getWaveConfig,
  GUARD_CONFIGS,
} from './types';
import { distance, generateId } from './utils';
import { getMapLayout } from './layout';

const GAME_TICK_MS = 33;
const GAME_DT = GAME_TICK_MS / 1000;
const GUARD_COMBAT_BUFFER = 0.82;

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const { width, height: windowHeight } = useWindowDimensions();
  const layout = useMemo(() => getMapLayout(width, windowHeight), [width, windowHeight]);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveSpawnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemySpawnCountRef = useRef(0);
  const waveTransitionRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const spawnWaveEnemies = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.gameActive || currentState.gameLost) return;

    if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
    enemySpawnCountRef.current = 0;
    waveTransitionRef.current = false;

    const waveConfig = getWaveConfig(currentState.wave);
    const enemiesPerSecond = Math.max(0.8, waveConfig.enemyCount / 6);

    waveSpawnerRef.current = setInterval(() => {
      const latestState = stateRef.current;
      if (!latestState.gameActive || latestState.gameLost) return;

      if (enemySpawnCountRef.current >= waveConfig.enemyCount) {
        if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
        return;
      }

      const newEnemy: Enemy = {
        id: generateId('enemy'),
        x: layout.centerX + (Math.random() * 24 - 12),
        y: layout.centerY - layout.spawnDistance,
        pathIndex: 0,
        pathProgress: 0,
        health: waveConfig.enemyHealth,
        maxHealth: waveConfig.enemyHealth,
        speed: waveConfig.enemySpeed,
        damage: waveConfig.enemyDamage,
        radius: waveConfig.isBossWave ? 18 : 12,
        color: waveConfig.isBossWave ? '#8B0000' : '#DC143C',
        isBoss: waveConfig.isBossWave,
        bossAbilities: waveConfig.isBossWave
          ? [
              { type: 'speedBoost', cooldown: 0, maxCooldown: 10 },
              { type: 'spawnMinions', cooldown: 0, maxCooldown: 15 },
            ]
          : undefined,
      };

      dispatch({ type: 'SPAWN_ENEMY', enemy: newEnemy });
      enemySpawnCountRef.current += 1;
    }, 1000 / enemiesPerSecond);
  }, [dispatch, layout.centerX, layout.centerY, layout.spawnDistance]);

  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    gameLoopRef.current = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      const previousAngle = currentState.sprinkler.angle;
      const newAngle =
        (previousAngle + currentState.sprinkler.rotationSpeed * GAME_DT) % (2 * Math.PI);
      dispatch({ type: 'UPDATE_SPRINKLER', angle: newAngle });

      if (newAngle < previousAngle) {
        dispatch({ type: 'RESET_WATERED_FLAGS' });
      }

      const normAngle = (newAngle + 2 * Math.PI) % (2 * Math.PI);
      const newGuards: Guard[] = [];

      currentState.plots.forEach((plot) => {
        if (!plot.cropType) return;

        const normStart = (plot.angleStart + 2 * Math.PI) % (2 * Math.PI);
        const normEnd = (plot.angleEnd + 2 * Math.PI) % (2 * Math.PI);
        const isOverPlot =
          normStart <= normEnd
            ? normAngle >= normStart && normAngle <= normEnd
            : normAngle >= normStart || normAngle <= normEnd;

        if (!isOverPlot || plot.isWateredThisCycle) return;

        dispatch({ type: 'SET_PLOT_WATERED', plotIndex: plot.index, watered: true });

        const config = GUARD_CONFIGS[plot.cropType];
        const plotAngleCenter = (plot.angleStart + plot.angleEnd) / 2;
        const plotX = layout.centerX + Math.cos(plotAngleCenter) * layout.plotDistance;
        const plotY = layout.centerY + Math.sin(plotAngleCenter) * layout.plotDistance;
        const guardsFromPlot = currentState.guards.filter((guard) => guard.plotIndex === plot.index);

        if (guardsFromPlot.length < 4) {
          newGuards.push({
            id: generateId('guard'),
            plotIndex: plot.index,
            x: plotX,
            y: plotY,
            type: plot.cropType,
            health: config.health,
            maxHealth: config.health,
            damage: config.damage,
            range: config.range,
            attackSpeed: config.attackSpeed,
            attackCooldown: 0,
            moveSpeed: config.moveSpeed,
            color: config.color,
          });
        }
      });

      const allGuards = newGuards.length > 0
        ? [...currentState.guards, ...newGuards]
        : currentState.guards;

      const updatedEnemies = currentState.enemies
        .map((enemy) => {
          const newProgress = Math.min(
            1,
            enemy.pathProgress + (enemy.speed * GAME_DT) / Math.max(layout.spawnDistance, 1),
          );
          const position = {
            x: layout.centerX,
            y: layout.centerY - layout.spawnDistance * (1 - newProgress),
          };
          const distToCenter = distance(
            { x: layout.centerX, y: layout.centerY },
            position,
          );

          if (distToCenter < INITIAL_GAME_CONFIG.plantationRadius + 15) {
            dispatch({ type: 'DAMAGE_PLANTATION', amount: enemy.damage });
            dispatch({ type: 'ENEMY_REACHED_CENTER', enemyId: enemy.id });
            return null;
          }

          return {
            ...enemy,
            x: position.x,
            y: position.y,
            pathProgress: newProgress,
          };
        })
        .filter((enemy): enemy is Enemy => enemy !== null);

      const remainingEnemies = [...updatedEnemies];
      const defeatedEnemyIds = new Set<string>();
      const updatedGuards = allGuards
        .map((guard) => {
          const target = remainingEnemies
            .filter((enemy) => enemy.health > 0)
            .sort(
              (first, second) =>
                distance({ x: guard.x, y: guard.y }, { x: first.x, y: first.y }) -
                distance({ x: guard.x, y: guard.y }, { x: second.x, y: second.y }),
            )[0];

          let nextX = guard.x;
          let nextY = guard.y;
          let nextCooldown = Math.max(0, guard.attackCooldown - GAME_DT);
          let targetId: string | undefined;

          if (target) {
            targetId = target.id;
            const targetDistance = distance(
              { x: guard.x, y: guard.y },
              { x: target.x, y: target.y },
            );
            const desiredDistance = guard.range * GUARD_COMBAT_BUFFER;

            if (targetDistance > desiredDistance) {
              const moveDistance = Math.min(
                targetDistance - desiredDistance,
                (guard.moveSpeed ?? 42) * GAME_DT,
              );
              const ratio = moveDistance / Math.max(targetDistance, 1);
              nextX += (target.x - guard.x) * ratio;
              nextY += (target.y - guard.y) * ratio;
            }

            const distanceAfterMove = distance(
              { x: nextX, y: nextY },
              { x: target.x, y: target.y },
            );
            if (distanceAfterMove <= guard.range && nextCooldown <= 0) {
              target.health -= guard.damage;
              nextCooldown = 1 / Math.max(guard.attackSpeed, 0.1);
              if (target.health <= 0) defeatedEnemyIds.add(target.id);
            }
          }

          return {
            ...guard,
            x: nextX,
            y: nextY,
            targetId,
            attackCooldown: nextCooldown,
          };
        })
        .filter((guard) => guard.health > 0);

      defeatedEnemyIds.forEach((enemyId) => {
        dispatch({ type: 'REMOVE_ENEMY', enemyId });
      });

      const aliveEnemies = remainingEnemies.filter((enemy) => enemy.health > 0);
      dispatch({ type: 'UPDATE_ENEMIES', enemies: aliveEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

      const waveConfig = getWaveConfig(currentState.wave);
      if (
        aliveEnemies.length === 0 &&
        enemySpawnCountRef.current >= waveConfig.enemyCount &&
        !waveTransitionRef.current
      ) {
        waveTransitionRef.current = true;
        waveTransitionTimeoutRef.current = setTimeout(() => {
          enemySpawnCountRef.current = 0;
          waveTransitionRef.current = false;
          dispatch({ type: 'NEXT_WAVE' });
        }, INITIAL_GAME_CONFIG.waveInterval * 1000);
      }
    }, GAME_TICK_MS);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (waveTransitionTimeoutRef.current) clearTimeout(waveTransitionTimeoutRef.current);
      waveTransitionRef.current = false;
    };
  }, [
    dispatch,
    layout.centerX,
    layout.centerY,
    layout.plotDistance,
    layout.spawnDistance,
    state.gameActive,
    state.gameLost,
  ]);

  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    spawnWaveEnemies();
    return () => {
      if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
    };
  }, [spawnWaveEnemies, state.gameActive, state.gameLost, state.wave]);
}
