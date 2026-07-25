import { useEffect, useRef, useCallback } from 'react';
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

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveSpawnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemySpawnCountRef = useRef(0);

  const mapCenterX = 200; // Approximate center
  const mapCenterY = 150;

  // Spawn enemies for current wave
  const spawnWaveEnemies = useCallback(() => {
    if (!state.gameActive || state.gameLost) return;

    const waveConfig = getWaveConfig(state.wave);
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

      dispatch({ type: 'UPDATE_ENEMIES', enemies: [...state.enemies, newEnemy] });
      enemySpawnCountRef.current++;
    }, 1000 / enemiesPerSecond);
  }, [state.wave, state.gameActive, state.gameLost, dispatch]);

  // Main game loop: update positions, handle attacks, etc.
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    gameLoopRef.current = setInterval(() => {
      // Update enemy positions
      const updatedEnemies = state.enemies
        .map((enemy) => {
          const newProgress = Math.min(
            1,
            enemy.pathProgress + (enemy.speed * 0.016) / 100 // 60fps update
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
      const updatedGuards = state.guards.map((guard) => {
        let newCooldown = Math.max(0, guard.attackCooldown - 0.016);

        // Find target
        const targets = updatedEnemies.filter(
          (e) => distance({ x: guard.x, y: guard.y }, { x: e.x, y: e.y }) < guard.range
        );

        if (targets.length > 0 && newCooldown <= 0) {
          const target = targets[0];
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

      dispatch({ type: 'UPDATE_ENEMIES', enemies: updatedEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

      // Check if wave is complete
      if (
        updatedEnemies.length === 0 &&
        enemySpawnCountRef.current >= getWaveConfig(state.wave).enemyCount
      ) {
        // Wave complete, prepare next wave
        setTimeout(() => {
          dispatch({ type: 'NEXT_WAVE' });
          enemySpawnCountRef.current = 0;
        }, 3000);
      }
    }, 16); // ~60fps

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [state.gameActive, state.gameLost, state.enemies, state.guards, dispatch]);

  // Start wave spawning
  useEffect(() => {
    enemySpawnCountRef.current = 0;
    spawnWaveEnemies();

    return () => {
      if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
    };
  }, [state.wave, spawnWaveEnemies]);
}
