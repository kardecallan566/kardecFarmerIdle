import { useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useGame } from './GameContext';
import { createAbilityRuntimeState, getAbilitiesForGuard, getAbilityDefinition } from './abilities';
import { consumePendingAbility, isAbilityActive } from './abilitySystem';
import { getRunGuardStats } from './guardStats';
import { getCounterDamageMultiplier } from './enemyCounters';
import {
  Enemy,
  Guard,
  getBeaconStats,
  getEnemyKindForSpawn,
  getEnemyProfile,
  getWaveConfig,
  INITIAL_GAME_CONFIG,
} from './types';
import { distance, generateId, getPositionOnPath } from './utils';
import { getMapLayout, getPlotPosition } from './layout';

const GAME_TICK_MS = 16;
const GAME_DT = GAME_TICK_MS / 1000;
const GUARD_COMBAT_BUFFER = 0.82;
const MAX_GUARDS_PER_PLOT = 4;

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
        const spawnLane = enemySpawnCountRef.current % INITIAL_GAME_CONFIG.pathCount;
        const spawnPoint = getPositionOnPath(
          layout.centerX,
          layout.centerY,
          spawnLane,
          INITIAL_GAME_CONFIG.pathCount,
          0,
          layout.spawnDistance,
        );
        const enemyKind = getEnemyKindForSpawn(currentState.wave, enemySpawnCountRef.current);
        const enemyProfile = getEnemyProfile(enemyKind, currentState.wave);
        const newEnemy: Enemy = {
          id: generateId('enemy'),
          kind: enemyKind,
          skinTier: enemyProfile.skinTier,
          bossEra: enemyProfile.bossEra,
          x: spawnPoint.x,
          y: spawnPoint.y,
          pathIndex: spawnLane,
          pathProgress: 0,
          health: enemyProfile.health,
          maxHealth: enemyProfile.health,
          speed: enemyProfile.speed,
          damage: enemyProfile.damage,
          troopDamage: enemyProfile.troopDamage,
          radius: enemyProfile.radius,
          color: enemyProfile.color,
          isBoss: enemyKind === 'boss',
          traversal: enemyProfile.traversal,
          plantationDamageMultiplier: enemyProfile.plantationDamageMultiplier,
          healingPower: enemyProfile.healingPower,
          abilityCooldown: enemyProfile.healingPower ? 0 : undefined,
          attackCooldown: 0,
          bossPhase: enemyKind === 'boss' ? 1 : undefined,
          bossAbilities: enemyKind === 'boss'
            ? [
                { type: 'speedBoost', cooldown: 0, maxCooldown: 10, minPhase: 1, telegraphSeconds: 1.2 },
                { type: 'spawnMinions', cooldown: 0, maxCooldown: 15, minPhase: 2, telegraphSeconds: 1.6 },
                { type: 'shockwave', cooldown: 0, maxCooldown: 18, minPhase: 3, telegraphSeconds: 2.1 },
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
          currentState.plots,
          plot.index,
          currentState.formation,
          currentState.ascensionLevel,
          currentState.technologyLevels,
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
            abilities: getAbilitiesForGuard(plot.cropType).map((ability) => createAbilityRuntimeState(ability.id)),
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
          const currentPosition = { x: enemy.x, y: enemy.y };
          const currentRadius = distance(
            { x: layout.centerX, y: layout.centerY },
            currentPosition,
          );
          let nextProgress = Math.min(
            1,
            enemy.pathProgress + (enemy.speed * GAME_DT) / Math.max(layout.spawnDistance, 1),
          );
          let position = getPositionOnPath(
            layout.centerX,
            layout.centerY,
            enemy.pathIndex,
            INITIAL_GAME_CONFIG.pathCount,
            nextProgress,
            layout.spawnDistance,
          );

          let guardTarget: Guard | undefined;
          let nearestGuardDistance = Number.POSITIVE_INFINITY;
          const canInterceptGuards = enemy.traversal !== 'flying' && enemy.traversal !== 'wraith';
          const tauntEffect = getAbilityDefinition('warrior-taunt').effect;
          const tauntRadius = tauntEffect.type === 'taunt' ? tauntEffect.radius : 0;
          const tauntingGuard = allGuards
            .filter((guard) => guard.health > 0 && isAbilityActive(guard, 'warrior-taunt'))
            .map((guard) => ({
              guard,
              guardDistance: distance(currentPosition, { x: guard.x, y: guard.y }),
            }))
            .find(({ guardDistance }) => guardDistance <= tauntRadius)?.guard;

          if (tauntingGuard && canInterceptGuards) {
            guardTarget = tauntingGuard;
            nearestGuardDistance = distance(currentPosition, { x: tauntingGuard.x, y: tauntingGuard.y });
          } else if (canInterceptGuards) {
            allGuards.forEach((guard) => {
              if (guard.health <= 0) return;
              const guardOffsetX = guard.x - layout.centerX;
              const guardOffsetY = guard.y - layout.centerY;
              const guardRadius = Math.hypot(guardOffsetX, guardOffsetY);
              if (guardRadius < INITIAL_GAME_CONFIG.plantationRadius + 24 || guardRadius > currentRadius + 28) return;
              const laneLength = Math.max(currentRadius, 1);
              const laneX = (currentPosition.x - layout.centerX) / laneLength;
              const laneY = (currentPosition.y - layout.centerY) / laneLength;
              const lateralDistance = Math.abs(guardOffsetX * laneY - guardOffsetY * laneX);
              if (lateralDistance > 46) return;
              const guardDistance = distance(currentPosition, { x: guard.x, y: guard.y });
              if (guardDistance < nearestGuardDistance) {
                nearestGuardDistance = guardDistance;
                guardTarget = guard;
              }
            });
          }

          if (guardTarget && nearestGuardDistance > enemy.radius + 18) {
            const moveDistance = Math.min(nearestGuardDistance - (enemy.radius + 18), enemy.speed * GAME_DT);
            const ratio = moveDistance / Math.max(nearestGuardDistance, 1);
            position = {
              x: currentPosition.x + (guardTarget.x - currentPosition.x) * ratio,
              y: currentPosition.y + (guardTarget.y - currentPosition.y) * ratio,
            };
            const distanceAfterMove = distance(
              { x: layout.centerX, y: layout.centerY },
              position,
            );
            nextProgress = Math.max(
              enemy.pathProgress,
              Math.min(1, 1 - distanceAfterMove / Math.max(layout.spawnDistance, 1)),
            );
          }

          const distToCenter = distance(
            { x: layout.centerX, y: layout.centerY },
            position,
          );

          if (distToCenter < INITIAL_GAME_CONFIG.plantationRadius + 15) {
            dispatch({
              type: 'DAMAGE_PLANTATION',
              amount: enemy.damage * (enemy.plantationDamageMultiplier ?? 1),
            });
            dispatch({ type: 'ENEMY_REACHED_CENTER', enemyId: enemy.id });
            return null;
          }

          return {
            ...enemy,
            x: position.x,
            y: position.y,
            pathProgress: nextProgress,
          };
        })
        .filter((enemy): enemy is Enemy => enemy !== null);

      const abilityAffectedEnemies = updatedEnemies.map((enemy) => ({ ...enemy }));
      const guardsAfterAbilityEffects = allGuards.map((guard) => {
        const pendingAbility = guard.abilities?.find((ability) => ability.pending);
        if (!pendingAbility) return guard;

        const definition = getAbilityDefinition(pendingAbility.abilityId);
        const areaEffect = definition.effect.type === 'areaDamage' ? definition.effect : null;
        if (areaEffect) {
          const targets = abilityAffectedEnemies
            .filter((enemy) =>
              enemy.health > 0 &&
              distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y }) <= areaEffect.radius,
            )
            .sort((left, right) =>
              distance({ x: guard.x, y: guard.y }, { x: left.x, y: left.y }) -
              distance({ x: guard.x, y: guard.y }, { x: right.x, y: right.y }),
            )
            .slice(0, areaEffect.maxTargets);

          targets.forEach((target) => {
            target.health -= guard.damage * areaEffect.damageMultiplier;
            if (target.health <= 0) defeatedEnemyIds.add(target.id);
          });
        }

        return consumePendingAbility(guard, pendingAbility.abilityId);
      });

      const incomingDamageByGuard = new Map<string, number>();
      const summonedEnemiesThisTick: Enemy[] = [];
      const bulwarkEffect = getAbilityDefinition('tank-bulwark').effect;
      const bulwarkReduction = bulwarkEffect.type === 'damageReduction' ? bulwarkEffect.reductionRatio : 0;
      const combatEnemies = abilityAffectedEnemies.map((enemy) => {
        const nextEnemyCooldown = Math.max(0, (enemy.attackCooldown ?? 0) - GAME_DT);
        let nextAbilityCooldown = Math.max(0, (enemy.abilityCooldown ?? 0) - GAME_DT);

        if (enemy.kind === 'summoner' && nextAbilityCooldown <= 0) {
          const minionProfile = getEnemyProfile('runner', currentState.wave);
          const minionCount = enemy.bossEra >= 2 ? 2 : 1;
          const summonedEnemies: Enemy[] = [];
          for (let index = 0; index < minionCount; index += 1) {
            const minionHealth = Math.max(10, Math.round(minionProfile.health * (0.9 + enemy.bossEra * 0.12)));
            summonedEnemies.push({
              id: generateId('summoned'),
              kind: 'runner',
              skinTier: enemy.skinTier,
              bossEra: enemy.bossEra,
              x: enemy.x + (index === 0 ? -10 : 10),
              y: enemy.y + (index === 0 ? 8 : -8),
              pathIndex: enemy.pathIndex,
              pathProgress: Math.max(0, enemy.pathProgress - 0.035),
              health: minionHealth,
              maxHealth: minionHealth,
              speed: minionProfile.speed * (0.9 + enemy.bossEra * 0.04),
              damage: minionProfile.damage,
              troopDamage: minionProfile.troopDamage,
              radius: minionProfile.radius,
              color: minionProfile.color,
              isBoss: false,
              traversal: 'ground',
              plantationDamageMultiplier: 1,
              attackCooldown: 0,
            });
          }
          summonedEnemiesThisTick.push(...summonedEnemies);
          nextAbilityCooldown = 7 - Math.min(2, enemy.bossEra * 0.4);
        }

        if (enemy.kind === 'healer' && nextAbilityCooldown <= 0) {
          let healingTarget: Enemy | undefined;
          let highestMissingHealth = 0;
          abilityAffectedEnemies.forEach((ally) => {
            if (ally.id === enemy.id || ally.health <= 0) return;
            if (distance({ x: ally.x, y: ally.y }, { x: enemy.x, y: enemy.y }) > 125) return;
            const missingHealth = ally.maxHealth - ally.health;
            if (missingHealth > highestMissingHealth) {
              highestMissingHealth = missingHealth;
              healingTarget = ally;
            }
          });
          if (healingTarget) {
            healingTarget.health = Math.min(healingTarget.maxHealth, healingTarget.health + (enemy.healingPower ?? 0));
            nextAbilityCooldown = 2.4;
          }
        }

        let guardTarget: Guard | undefined;
        let nearestGuardDistance = enemy.radius + 18;
        guardsAfterAbilityEffects.forEach((guard) => {
          if (guard.health <= 0) return;
          const currentDistance = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
          if (currentDistance <= nearestGuardDistance) {
            nearestGuardDistance = currentDistance;
            guardTarget = guard;
          }
        });
        let attackCooldown = nextEnemyCooldown;

        if (guardTarget && attackCooldown <= 0) {
          const damageMultiplier = isAbilityActive(guardTarget, 'tank-bulwark')
            ? 1 - bulwarkReduction
            : 1;
          incomingDamageByGuard.set(
            guardTarget.id,
            (incomingDamageByGuard.get(guardTarget.id) ?? 0) + enemy.troopDamage * damageMultiplier,
          );
          attackCooldown = 0.9;
        }

        return { ...enemy, attackCooldown, abilityCooldown: nextAbilityCooldown };
      });

      const guardsAfterDamage = guardsAfterAbilityEffects
        .map((guard) => ({
          ...guard,
          health: Math.max(0, guard.health - (incomingDamageByGuard.get(guard.id) ?? 0)),
        }))
        .filter((guard) => guard.health > 0);

      const updatedGuards = guardsAfterDamage
        .map((guard) => {
          let nextX = guard.x;
          let nextY = guard.y;
          let nextCooldown = Math.max(0, guard.attackCooldown - GAME_DT);
          let targetId: string | undefined;

          let target: Enemy | undefined;
          let nearestEnemyDistance = Number.POSITIVE_INFINITY;
          combatEnemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            const currentDistance = distance({ x: guard.x, y: guard.y }, { x: enemy.x, y: enemy.y });
            if (currentDistance < nearestEnemyDistance) {
              nearestEnemyDistance = currentDistance;
              target = enemy;
            }
          });

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
              target.health -= guard.damage * getCounterDamageMultiplier(guard.type, target.kind);
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

      if (summonedEnemiesThisTick.length > 0) {
        dispatch({ type: 'ADD_ENEMIES', enemies: summonedEnemiesThisTick });
      }

      defeatedEnemyIds.forEach((enemyId) => {
        dispatch({ type: 'REMOVE_ENEMY', enemyId });
      });

      const aliveEnemies = combatEnemies.filter((enemy) => enemy.health > 0);
      dispatch({ type: 'UPDATE_ENEMIES', enemies: aliveEnemies });
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });

      if (
        aliveEnemies.length === 0 &&
        summonedEnemiesThisTick.length === 0 &&
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
      if (gameLoopRef.current !== null) clearInterval(gameLoopRef.current);
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
