import { useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useGame } from './GameContext';
import {
  Enemy,
  Guard,
  INITIAL_GAME_CONFIG,
  getWaveConfig,
  GUARD_CONFIGS,
} from './types';
import {
  getSpawnPoint,
  getPositionOnPath,
  distance,
  generateId,
} from './utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveSpawnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemySpawnCountRef = useRef(0);

  const mapCenterX = screenWidth / 2;
  const mapCenterY = screenHeight / 2 - 100;

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Spawn enemies for current wave
  const spawnWaveEnemies = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.gameActive || currentState.gameLost) return;

    const waveConfig = getWaveConfig(currentState.wave);
    const enemiesPerSecond = Math.max(1, waveConfig.enemyCount / 5); // Spread over 5 seconds

    waveSpawnerRef.current = setInterval(() => {
      if (enemySpawnCountRef.current >= waveConfig.enemyCount) {
        if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
        return;
      }

      const pathIndex = Math.floor(
        Math.random() * INITIAL_GAME_CONFIG.pathCount
      );
      const spawnPoint = getSpawnPoint(
        mapCenterX,
        mapCenterY,
        pathIndex,
        INITIAL_GAME_CONFIG.pathCount,
        INITIAL_GAME_CONFIG.spawnDistance
      );

      const newEnemy: Enemy = {
        id: generateId('enemy'),
        x: spawnPoint.x,
        y: spawnPoint.y,
        pathIndex,
        pathProgress: 0,
        health: waveConfig.enemyHealth,
        maxHealth: waveConfig.enemyHealth,
        speed: waveConfig.enemySpeed,
        damage: waveConfig.enemyDamage,
        radius: 6,
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
      enemySpawnCountRef.current++;
    }, 1000 / enemiesPerSecond);
  }, [dispatch]);

  // Main game loop: update positions, handle attacks, etc.
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    gameLoopRef.current = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      // Update enemy positions
      const updatedEnemies = currentState.enemies
        .map((enemy) => {
          const newProgress = Math.min(
            1,
            enemy.pathProgress + (enemy.speed * 0.03) / 100
          );
          const newPos = getPositionOnPath(
            mapCenterX,
            mapCenterY,
            enemy.pathIndex,
            INITIAL_GAME_CONFIG.pathCount,
            newProgress,
            INITIAL_GAME_CONFIG.mapRadius
          );

          // Check if reached center
          const distToCenter = distance(
            { x: mapCenterX, y: mapCenterY },
            newPos
          );
          if (distToCenter < INITIAL_GAME_CONFIG.plantationRadius + 10) {
            dispatch({
              type: 'DAMAGE_PLANTATION',
              amount: enemy.damage,
            });
            dispatch({ type: 'REMOVE_ENEMY', enemyId: enemy.id });
            return null;
          }

          return {
            ...enemy,
            x: newPos.x,
            y: newPos.y,
            pathProgress: newProgress,
          };
        })
        .filter((e) => e !== null) as Enemy[];

      // Update guard attacks
      const remainingEnemies = [...updatedEnemies];
      const updatedGuards = currentState.guards.map((guard) => {
        let newCooldown = Math.max(0, guard.attackCooldown - 0.03);

        // Find target
        const target = remainingEnemies.find(
          (e) => e.health > 0 && distance({ x: guard.x, y: guard.y }, { x: e.x, y: e.y }) < guard.range
        );

        if (target && newCooldown <= 0) {
          // Deal damage to target
          target.health -= guard.damage;
          newCooldown = 1 / guard.attackSpeed; // Reset cooldown

          // Remove dead enemies
          if (target.health <= 0) {
            dispatch({ type: 'REMOVE_ENEMY', enemyId: target.id });
          }
        }

        return { ...guard, attackCooldown: newCooldown };
      });

      const aliveEnemies = remainingEnemies.filter((e) => e.health > 0);

      dispatch({ type: 'UPDATE_ENEMIES', enemies: aliveEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

      // Check if wave is complete
      if (
        updatedEnemies.length === 0 &&
        enemySpawnCountRef.current >= getWaveConfig(currentState.wave).enemyCount
      ) {
        // Wave complete, prepare next wave
        setTimeout(() => {
          dispatch({ type: 'NEXT_WAVE' });
          enemySpawnCountRef.current = 0;
        }, 3000);
      }
    }, 33); // ~30fps for smooth state updates without loop thrashing

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [state.gameActive, state.gameLost, dispatch]);

  // Start wave spawning
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    enemySpawnCountRef.current = 0;
    spawnWaveEnemies();

    return () => {
      if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
    };
  }, [state.wave, state.gameActive, state.gameLost, spawnWaveEnemies]);
}
