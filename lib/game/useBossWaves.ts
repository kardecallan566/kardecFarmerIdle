import { useEffect, useRef } from 'react';
import { getBossPhase } from './bossPhases';
import { useGame } from './GameContext';
import type { BossAbility, Enemy, Guard } from './types';
import { distance, generateId } from './utils';

const TELEGRAPH_COLORS: Record<BossAbility['type'], string> = {
  speedBoost: '#F7D774',
  spawnMinions: '#C98AF2',
  shockwave: '#F07863',
};

function isAbilityAvailable(ability: BossAbility, phaseNumber: number): boolean {
  return (ability.minPhase ?? 1) <= phaseNumber;
}

export function useBossWaves() {
  const { state, dispatch } = useGame();
  const bossAbilityCooldownsRef = useRef<Map<string, number>>(new Map());
  const speedResetTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    const bossAbilityInterval = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      const bosses = currentState.enemies.filter((enemy) => enemy.isBoss);

      bosses.forEach((boss) => {
        if (!boss.bossAbilities?.length) return;

        const phase = getBossPhase(boss.health, boss.maxHealth);
        if (boss.bossPhase !== phase.phase) {
          dispatch({
            type: 'UPDATE_ENEMY',
            enemyId: boss.id,
            patch: { bossPhase: phase.phase, bossTelegraph: undefined },
          });
        }

        boss.bossAbilities.forEach((ability) => {
          const key = `${boss.id}_${ability.type}`;
          const nextCooldown = Math.max(0, (bossAbilityCooldownsRef.current.get(key) ?? 0) - 0.1);
          bossAbilityCooldownsRef.current.set(key, nextCooldown);
        });

        const activeTelegraph = boss.bossTelegraph;
        if (activeTelegraph) {
          const telegraphRemaining = activeTelegraph.remaining - 0.1;
          if (telegraphRemaining > 0) {
            dispatch({
              type: 'UPDATE_ENEMY',
              enemyId: boss.id,
              patch: {
                bossTelegraph: {
                  ...activeTelegraph,
                  remaining: telegraphRemaining,
                },
              },
            });
            return;
          }

          const ability = boss.bossAbilities.find((candidate) => candidate.type === activeTelegraph.type);
          dispatch({ type: 'UPDATE_ENEMY', enemyId: boss.id, patch: { bossTelegraph: undefined } });
          if (ability && isAbilityAvailable(ability, phase.phase)) {
            executeBossAbility(boss, ability, currentState, dispatch, speedResetTimersRef);
          }
          return;
        }

        const readyAbility = boss.bossAbilities.find((ability) =>
          isAbilityAvailable(ability, phase.phase) &&
          (bossAbilityCooldownsRef.current.get(`${boss.id}_${ability.type}`) ?? 0) <= 0,
        );

        if (!readyAbility) return;

        const telegraphDuration = readyAbility.telegraphSeconds ?? 1.2;
        dispatch({
          type: 'UPDATE_ENEMY',
          enemyId: boss.id,
          patch: {
            bossTelegraph: {
              type: readyAbility.type,
              remaining: telegraphDuration,
              duration: telegraphDuration,
              color: TELEGRAPH_COLORS[readyAbility.type],
            },
          },
        });
        bossAbilityCooldownsRef.current.set(`${boss.id}_${readyAbility.type}`, readyAbility.maxCooldown);
      });
    }, 100);

    return () => clearInterval(bossAbilityInterval);
  }, [state.gameActive, state.gameLost, dispatch]);

  useEffect(() => {
    return () => {
      speedResetTimersRef.current.forEach((timer) => clearTimeout(timer));
      speedResetTimersRef.current.clear();
      bossAbilityCooldownsRef.current.clear();
    };
  }, []);

  return {
    hasBoss: state.enemies.some((enemy) => enemy.isBoss),
    bossCount: state.enemies.filter((enemy) => enemy.isBoss).length,
  };
}

function executeBossAbility(
  boss: Enemy,
  ability: BossAbility,
  currentState: ReturnType<typeof useGame>['state'],
  dispatch: ReturnType<typeof useGame>['dispatch'],
  speedResetTimersRef: React.MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>,
) {
  const phase = boss.bossPhase ?? 1;

  if (ability.type === 'speedBoost') {
    const baseSpeed = boss.speed;
    dispatch({
      type: 'UPDATE_ENEMY',
      enemyId: boss.id,
      patch: { speed: baseSpeed * (1.35 + phase * 0.08) },
    });

    const previousTimer = speedResetTimersRef.current.get(boss.id);
    if (previousTimer) clearTimeout(previousTimer);
    const resetTimer = setTimeout(() => {
      dispatch({ type: 'UPDATE_ENEMY', enemyId: boss.id, patch: { speed: baseSpeed } });
      speedResetTimersRef.current.delete(boss.id);
    }, 5000);
    speedResetTimersRef.current.set(boss.id, resetTimer);
    return;
  }

  if (ability.type === 'spawnMinions') {
    const minionCount = 2 + Math.min(3, phase);
    const newMinions: Enemy[] = [];
    for (let index = 0; index < minionCount; index += 1) {
      const minionHealth = Math.max(12, Math.round(boss.maxHealth * (0.1 + phase * 0.025)));
      const minionX = boss.x + (index - (minionCount - 1) / 2) * 9;
      const minionY = boss.y + (index - (minionCount - 1) / 2) * 14;
      newMinions.push({
        id: generateId('minion'),
        kind: phase >= 3 && index % 2 === 0 ? 'brute' : 'runner',
        skinTier: boss.skinTier,
        bossEra: boss.bossEra,
        x: minionX,
        y: minionY,
        pathIndex: boss.pathIndex,
        pathProgress: Math.max(0, boss.pathProgress - 0.02 * (index + 1)),
        health: minionHealth,
        maxHealth: minionHealth,
        speed: boss.speed * (0.78 + phase * 0.04),
        damage: Math.max(2, boss.damage * (0.45 + phase * 0.08)),
        troopDamage: Math.max(8, boss.troopDamage * (0.48 + phase * 0.08)),
        radius: phase >= 3 && index % 2 === 0 ? 15 : 8,
        color: phase >= 3 && index % 2 === 0 ? '#7A3F2B' : '#DC143C',
        isBoss: false,
        attackCooldown: 0,
      });
    }
    dispatch({ type: 'ADD_ENEMIES', enemies: newMinions });
    return;
  }

  const shockwaveRadius = 120 + phase * 18;
  const shockwaveDamage = Math.round(boss.troopDamage * (0.7 + phase * 0.12));
  const guardsAfterShockwave = currentState.guards
    .map((guard: Guard) => {
      const hit = distance({ x: guard.x, y: guard.y }, { x: boss.x, y: boss.y }) <= shockwaveRadius;
      return hit ? { ...guard, health: Math.max(0, guard.health - shockwaveDamage) } : guard;
    })
    .filter((guard) => guard.health > 0);
  dispatch({ type: 'UPDATE_GUARDS', guards: guardsAfterShockwave });
}
