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
import { distance, generateId } from './utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveSpawnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemySpawnCountRef = useRef(0);

  const mapCenterX = screenWidth / 2;
  const mapCenterY = screenHeight / 2 - 80;

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Spawn enemies for current wave down the top single lane
  const spawnWaveEnemies = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.gameActive || currentState.gameLost) return;

    const waveConfig = getWaveConfig(currentState.wave);
    const enemiesPerSecond = Math.max(0.8, waveConfig.enemyCount / 6);

    waveSpawnerRef.current = setInterval(() => {
      if (enemySpawnCountRef.current >= waveConfig.enemyCount) {
        if (waveSpawnerRef.current) clearInterval(waveSpawnerRef.current);
        return;
      }

      // Single lane coming from top (mapCenterX, mapCenterY - spawnDistance)
      const spawnX = mapCenterX + (Math.random() * 24 - 12);
      const spawnY = mapCenterY - INITIAL_GAME_CONFIG.spawnDistance;

      const newEnemy: Enemy = {
        id: generateId('enemy'),
        x: spawnX,
        y: spawnY,
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
      enemySpawnCountRef.current++;
    }, 1000 / enemiesPerSecond);
  }, [dispatch]);

  // Main game loop: update sprinkler rotation, spawn soldiers on watering, move enemies, handle attacks
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    const dt = 0.033; // ~30fps step (33ms)

    gameLoopRef.current = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      // 1. Update Sprinkler rotation angle
      const prevAngle = currentState.sprinkler.angle;
      let newAngle = (prevAngle + currentState.sprinkler.rotationSpeed * dt) % (2 * Math.PI);
      dispatch({ type: 'UPDATE_SPRINKLER', angle: newAngle });

      // Check if full 360 rotation wrapped around (prev > new angle)
      const fullRotationCompleted = newAngle < prevAngle;

      if (fullRotationCompleted) {
        dispatch({ type: 'RESET_WATERED_FLAGS' });
      }

      // 2. Check plots watering & spawn defending soldiers from watered planted crops
      const plotRadius = 75; // Distance of plot centers from Regador
      const newGuards: Guard[] = [];

      currentState.plots.forEach((plot) => {
        if (!plot.cropType) return; // Empty plot

        // Check if sprinkler angle is sweeping over this plot's quadrant
        const normAngle = (newAngle + 2 * Math.PI) % (2 * Math.PI);
        const normStart = (plot.angleStart + 2 * Math.PI) % (2 * Math.PI);
        const normEnd = (plot.angleEnd + 2 * Math.PI) % (2 * Math.PI);

        let isOverPlot = false;
        if (normStart <= normEnd) {
          isOverPlot = normAngle >= normStart && normAngle <= normEnd;
        } else {
          isOverPlot = normAngle >= normStart || normAngle <= normEnd;
        }

        if (isOverPlot && !plot.isWateredThisCycle) {
          dispatch({ type: 'SET_PLOT_WATERED', plotIndex: plot.index, watered: true });

          // SPAWN SOLDIER FROM WATERED CROP!
          const config = GUARD_CONFIGS[plot.cropType];
          
          // Plot center position
          const plotAngleCenter = (plot.angleStart + plot.angleEnd) / 2;
          const plotX = mapCenterX + Math.cos(plotAngleCenter) * plotRadius;
          const plotY = mapCenterY + Math.sin(plotAngleCenter) * plotRadius;

          // Soldier steps out slightly towards defense line
          const guardX = plotX + (mapCenterX - plotX) * 0.2;
          const guardY = plotY + (mapCenterY - plotY) * 0.2;

          // Limit total active guards per plot to max 4
          const guardsFromPlot = currentState.guards.filter(g => g.plotIndex === plot.index);
          if (guardsFromPlot.length < 4) {
            newGuards.push({
              id: generateId('guard'),
              plotIndex: plot.index,
              x: guardX,
              y: guardY,
              type: plot.cropType,
              health: config.health,
              maxHealth: config.health,
              damage: config.damage,
              range: config.range,
              attackSpeed: config.attackSpeed,
              attackCooldown: 0,
              color: config.color,
            });
          }
        }
      });

      let allGuards = [...currentState.guards];
      if (newGuards.length > 0) {
        allGuards = [...allGuards, ...newGuards];
      }

      // 3. Move Enemies down top single lane towards center Regador
      const updatedEnemies = currentState.enemies
        .map((enemy) => {
          const newProgress = Math.min(
            1,
            enemy.pathProgress + (enemy.speed * dt) / 25
          );

          // Position moving down from top (mapCenterY - spawnDistance) to mapCenterY
          const startY = mapCenterY - INITIAL_GAME_CONFIG.spawnDistance;
          const currentY = startY + newProgress * INITIAL_GAME_CONFIG.spawnDistance;
          const currentX = enemy.x; // Keep lane alignment

          // Check if reached Regador at center
          const distToCenter = distance(
            { x: mapCenterX, y: mapCenterY },
            { x: currentX, y: currentY }
          );

          if (distToCenter < INITIAL_GAME_CONFIG.plantationRadius + 15) {
            dispatch({
              type: 'DAMAGE_PLANTATION',
              amount: enemy.damage,
            });
            dispatch({ type: 'REMOVE_ENEMY', enemyId: enemy.id });
            return null;
          }

          return {
            ...enemy,
            x: currentX,
            y: currentY,
            pathProgress: newProgress,
          };
        })
        .filter((e) => e !== null) as Enemy[];

      // 4. Soldier combat & guard attack updates
      const remainingEnemies = [...updatedEnemies];
      const updatedGuards = allGuards
        .map((guard) => {
          let newCooldown = Math.max(0, guard.attackCooldown - dt);

          // Find target enemy within attack range
          const target = remainingEnemies.find(
            (e) => e.health > 0 && distance({ x: guard.x, y: guard.y }, { x: e.x, y: e.y }) <= guard.range
          );

          if (target && newCooldown <= 0) {
            target.health -= guard.damage;
            newCooldown = 1 / guard.attackSpeed;

            if (target.health <= 0) {
              dispatch({ type: 'REMOVE_ENEMY', enemyId: target.id });
            }
          }

          return { ...guard, attackCooldown: newCooldown };
        })
        .filter(g => g.health > 0);

      const aliveEnemies = remainingEnemies.filter((e) => e.health > 0);

      dispatch({ type: 'UPDATE_ENEMIES', enemies: aliveEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

      // 5. Check wave completion
      if (
        updatedEnemies.length === 0 &&
        enemySpawnCountRef.current >= getWaveConfig(currentState.wave).enemyCount
      ) {
        setTimeout(() => {
          dispatch({ type: 'NEXT_WAVE' });
          enemySpawnCountRef.current = 0;
        }, 3000);
      }
    }, 33); // ~30fps

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
