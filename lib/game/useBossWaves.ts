import { useEffect, useRef } from 'react';
import { useGame } from './GameContext';
import { Enemy } from './types';
import { generateId } from './utils';

export function useBossWaves() {
  const { state, dispatch } = useGame();
  const bossAbilityCooldownsRef = useRef<Map<string, number>>(new Map());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle boss abilities
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    const bossAbilityInterval = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.gameActive || currentState.gameLost) return;

      const bosses = currentState.enemies.filter((e) => e.isBoss);

      bosses.forEach((boss) => {
        if (!boss.bossAbilities) return;

        boss.bossAbilities.forEach((ability) => {
          const currentCooldown = bossAbilityCooldownsRef.current.get(`${boss.id}_${ability.type}`) || 0;

          if (currentCooldown <= 0) {
            // Execute ability
            if (ability.type === 'speedBoost') {
              // Atualiza somente o chefe; o loop principal continua dono das posições.
              const boostedSpeed = boss.speed * 1.5;
              dispatch({
                type: 'UPDATE_ENEMY',
                enemyId: boss.id,
                patch: { speed: boostedSpeed },
              });

              // Reverte somente a velocidade após o impulso.
              setTimeout(() => {
                dispatch({
                  type: 'UPDATE_ENEMY',
                  enemyId: boss.id,
                  patch: { speed: boss.speed },
                });
              }, 5000);

              bossAbilityCooldownsRef.current.set(
                `${boss.id}_${ability.type}`,
                ability.maxCooldown
              );
            } else if (ability.type === 'spawnMinions') {
              // Spawn small enemies around boss
              const newMinions: Enemy[] = [];
              for (let i = 0; i < 3; i++) {
                const minionHealth = Math.max(12, Math.round(boss.maxHealth * 0.14));
                const minionX = boss.x;
                const minionY = boss.y + (i - 1) * 14;

                newMinions.push({
                  id: generateId(`minion_${boss.id}`),
                  x: minionX,
                  y: minionY,
                  pathIndex: boss.pathIndex,
                  pathProgress: Math.max(0, boss.pathProgress - 0.02 * (i + 1)),
                  health: minionHealth,
                  maxHealth: minionHealth,
                  speed: boss.speed * 0.82,
                  damage: Math.max(2, boss.damage * 0.55),
                  radius: 8,
                  color: '#DC143C',
                  isBoss: false,
                });
              }

              dispatch({ type: 'ADD_ENEMIES', enemies: newMinions });

              bossAbilityCooldownsRef.current.set(
                `${boss.id}_${ability.type}`,
                ability.maxCooldown
              );
            }
          } else {
            bossAbilityCooldownsRef.current.set(
              `${boss.id}_${ability.type}`,
              currentCooldown - 0.1
            );
          }
        });
      });
    }, 100);

    return () => clearInterval(bossAbilityInterval);
  }, [state.gameActive, state.gameLost, dispatch]);

  return {
    hasBoss: state.enemies.some((e) => e.isBoss),
    bossCount: state.enemies.filter((e) => e.isBoss).length,
  };
}
