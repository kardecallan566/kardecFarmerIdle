import { useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useGame } from './GameContext';
import {
  Enemy,
  Guard,
  GuardType,
  Upgrade,
  getBeaconStats,
  getEnemyKindForSpawn,
  getEnemyProfile,
  getGuardStats,
  getWaveConfig,
  INITIAL_GAME_CONFIG,
} from './types';
import { distance, generateId } from './utils';
import { getMapLayout, getPlotPosition } from './layout';

const GAME_TICK_MS = 33;
const GAME_DT = GAME_TICK_MS / 1000;
const GUARD_COMBAT_BUFFER = 0.82;
const MAX_GUARDS_PER_PLOT = 4;

function getRunGuardStats(type: GuardType, persistentLevel: number, upgrades: Upgrade[]) {
  const base = getGuardStats(type, persistentLevel);
  let damageMultiplier = 1;
  let rangeMultiplier = 1;
  let healthBonus = 0;
  let specificDamage = 0;
  let specificRange = 0;
  let specificHealth = 0;

  upgrades.forEach((upgrade) => {
    if (upgrade.type === 'damage') damageMultiplier *= 1 + upgrade.value;
    if (upgrade.type === 'range') rangeMultiplier *= 1 + upgrade.value * 0.1;
    if (upgrade.type === 'health') healthBonus += upgrade.value;
    if (upgrade.type === 'guardSpecific' && upgrade.targetGuard === type) {
      const stat = upgrade.stat ?? 'damage';
      if (stat === 'damage') specificDamage += upgrade.value;
      if (stat === 'range') specificRange += upgrade.value;
      if (stat === 'health') specificHealth += upgrade.value;
    }
  });

  return {
    ...base,
    damage: base.damage * damageMultiplier * (1 + specificDamage),
    range: base.range * rangeMultiplier * (1 + specificRange),
    health: base.health + healthBonus + base.health * specificHealth,
  };
}

function clampGuardToHoldRadius(
  centerX: number,
  centerY: number,
  x: number,
  y: number,
  holdRadius: number,
) {
  const offsetX = x - centerX;
  const offsetY = y - centerY;
  const currentRadius = Math.hypot(offsetX, offsetY);
  if (currentRadius >= holdRadius || currentRadius < 0.001) {
    return { x, y };
  }

  const scale = holdRadius / currentRadius;
  return {
    x: centerX + offsetX * scale,
    y: centerY + offsetY * scale,
  };
}

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const { width, height: windowHeight } = useWindowDimensions();
  const isBossWave = getWaveConfig(state.wave).isBossWave;
  const layout = useMemo(() => getMapLayout(width, windowHeight, isBossWave), [width, windowHeight, isBossWave]);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemySpawnTimerRef = useRef(0);
  const spawnedWaveRef = useRef(0);
  const waveTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemySpawnCountRef = useRef(0);
  const waveTransitionRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    enemySpawnTimerRef.current = 0;
    enemySpawnCountRef.current = 0;
    spawnedWaveRef.current = 0;
    gameLoopRef.current = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      const waveConfig = getWaveConfig(currentState.wave);
      if (spawnedWaveRef.current !== currentState.wave) {
        spawnedWaveRef.current = currentState.wave;
        enemySpawnTimerRef.current = 0;
        enemySpawnCountRef.current = 0;
        waveTransitionRef.current = false;
      }

      enemySpawnTimerRef.current += GAME_DT;
      const spawnInterval = 1 / Math.max(0.8, waveConfig.enemyCount / 6);
      if (
        enemySpawnCountRef.current < waveConfig.enemyCount &&
        enemySpawnTimerRef.current >= spawnInterval
      ) {
        enemySpawnTimerRef.current -= spawnInterval;
        const enemyKind = getEnemyKindForSpawn(currentState.wave, enemySpawnCountRef.current);
        const enemyProfile = getEnemyProfile(enemyKind, currentState.wave);
        const newEnemy: Enemy = {
          id: generateId('enemy'),
          kind: enemyKind,
          skinTier: enemyProfile.skinTier,
          bossEra: enemyProfile.bossEra,
          x: layout.centerX,
          y: layout.centerY - layout.spawnDistance,
          pathIndex: 0,
          pathProgress: 0,
          health: enemyProfile.health,
          maxHealth: enemyProfile.health,
          speed: enemyProfile.speed,
          damage: enemyProfile.damage,
          troopDamage: enemyProfile.troopDamage,
          radius: enemyProfile.radius,
          color: enemyProfile.color,
          isBoss: enemyKind === 'boss',
          healingPower: enemyProfile.healingPower,
          abilityCooldown: enemyProfile.healingPower ? 0 : undefined,
          attackCooldown: 0,
          bossAbilities: enemyKind === 'boss'
            ? [
                { type: 'speedBoost', cooldown: 0, maxCooldown: 10 },
                { type: 'spawnMinions', cooldown: 0, maxCooldown: 15 },
              ]
            : undefined,
        };
        dispatch({ type: 'SPAWN_ENEMY', enemy: newEnemy });
        enemySpawnCountRef.current += 1;
      }

      const previousAngle = currentState.sprinkler.angle;
      const newAngle =
        (previousAngle + currentState.sprinkler.rotationSpeed * GAME_DT) % (2 * Math.PI);
      dispatch({ type: 'UPDATE_SPRINKLER', angle: newAngle });

      if (newAngle < previousAngle) {
        dispatch({ type: 'RESET_WATERED_FLAGS' });
      }

      const normAngle = (newAngle + 2 * Math.PI) % (2 * Math.PI);
      const newGuards: Guard[] = [];
      const beaconStats = getBeaconStats(currentState.beaconUpgradeLevels);

      currentState.plots.forEach((plot) => {
        if (!plot.cropType || !plot.unlocked) return;

        const normStart = (plot.angleStart + 2 * Math.PI) % (2 * Math.PI);
        const normEnd = (plot.angleEnd + 2 * Math.PI) % (2 * Math.PI);
        const isOverPlot =
          normStart <= normEnd
            ? normAngle >= normStart && normAngle <= normEnd
            : normAngle >= normStart || normAngle <= normEnd;

        if (!isOverPlot || plot.isWateredThisCycle) return;

        dispatch({ type: 'SET_PLOT_WATERED', plotIndex: plot.index, watered: true });

        const config = getRunGuardStats(
          plot.cropType,
          currentState.troopUpgradeLevels[plot.cropType],
          currentState.upgrades,
        );
        const plotPosition = getPlotPosition(
          plot.index,
          layout.centerX,
          layout.centerY,
          layout.plotDistance,
        );
        const plotX = plotPosition.x;
        const plotY = plotPosition.y;
        const guardsFromPlot = currentState.guards.filter((guard) => guard.plotIndex === plot.index);
        const availableSlots = Math.max(0, MAX_GUARDS_PER_PLOT - guardsFromPlot.length);
        const spawnCount = Math.min(beaconStats.spawnBatch, availableSlots);

        for (let spawnIndex = 0; spawnIndex < spawnCount; spawnIndex += 1) {
          const centeredIndex = spawnIndex - (spawnCount - 1) / 2;
          newGuards.push({
            id: generateId('guard'),
            plotIndex: plot.index,
            x: plotX + centeredIndex * 6,
            y: plotY + Math.abs(centeredIndex) * 3,
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

      const defeatedEnemyIds = new Set<string>();
      const enemiesForTick = [...currentState.enemies];
      const updatedEnemies = enemiesForTick
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

      const incomingDamageByGuard = new Map<string, number>();
      const combatEnemies = updatedEnemies.map((enemy) => {
        const nextEnemyCooldown = Math.max(0, (enemy.attackCooldown ?? 0) - GAME_DT);
        let nextAbilityCooldown = Math.max(0, (enemy.abilityCooldown ?? 0) - GAME_DT);

        if (enemy.kind === 'healer' && nextAbilityCooldown <= 0) {
          const healingTarget = updatedEnemies
            .filter((ally) => ally.id !== enemy.id && ally.health > 0 && distance({ x: ally.x, y: ally.y }, { x: enemy.x, y: enemy.y }) <= 125)
            .sort((first, second) => (second.maxHealth - second.health) - (first.maxHealth - first.health))[0];
          if (healingTarget && healingTarget.health < healingTarget.maxHealth) {
            healingTarget.health = Math.min(healingTarget.maxHealth, healingTarget.health + (enemy.healingPower ?? 0));
            nextAbilityCooldown = 2.4;
          }
        }

        const guardTarget = allGuards
          .filter((guard) =>
            distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y }) <= enemy.radius + 18,
          )
          .sort(
            (first, second) =>
              distance({ x: first.x, y: first.y }, { x: enemy.x, y: enemy.y }) -
              distance({ x: second.x, y: second.y }, { x: enemy.x, y: enemy.y }),
          )[0];
        let attackCooldown = nextEnemyCooldown;

        if (guardTarget && attackCooldown <= 0) {
          incomingDamageByGuard.set(
            guardTarget.id,
            (incomingDamageByGuard.get(guardTarget.id) ?? 0) + enemy.troopDamage,
          );
          attackCooldown = 0.9;
        }

        return { ...enemy, attackCooldown, abilityCooldown: nextAbilityCooldown };
      });

      const guardsAfterDamage = allGuards
        .map((guard) => ({
          ...guard,
          health: Math.max(0, guard.health - (incomingDamageByGuard.get(guard.id) ?? 0)),
        }))
        .filter((guard) => guard.health > 0);

      const updatedGuards = guardsAfterDamage
        .map((guard) => {
          const target = combatEnemies
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
              const candidate = clampGuardToHoldRadius(
                layout.centerX,
                layout.centerY,
                guard.x + (target.x - guard.x) * ratio,
                guard.y + (target.y - guard.y) * ratio,
                layout.guardHoldDistance,
              );
              nextX = candidate.x;
              nextY = candidate.y;
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

      const aliveEnemies = combatEnemies.filter((enemy) => enemy.health > 0);
      dispatch({ type: 'UPDATE_ENEMIES', enemies: aliveEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

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
      enemySpawnTimerRef.current = 0;
    };
  }, [
    dispatch,
    layout.centerX,
    layout.centerY,
    layout.plotDistance,
    layout.spawnDistance,
    layout.guardHoldDistance,
    state.gameActive,
    state.gameLost,
  ]);
}
