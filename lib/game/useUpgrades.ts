import { useEffect } from 'react';
import { useGame } from './GameContext';
import { GUARD_CONFIGS } from './types';

export function useUpgrades() {
  const { state, dispatch } = useGame();

  // Apply upgrades to guards and game state
  useEffect(() => {
    if (state.upgrades.length === 0) return;

    const lastUpgrade = state.upgrades[state.upgrades.length - 1];

    // Calculate cumulative upgrade effects
    let damageMultiplier = 1;
    let rangeMultiplier = 1;
    let costMultiplier = 1;
    let healthBonus = 0;
    const guardSpecificUpgrades: Record<string, { damage: number; range: number; health: number }> = {};

    state.upgrades.forEach((upgrade) => {
      switch (upgrade.type) {
        case 'damage':
          damageMultiplier *= 1 + upgrade.value;
          break;
        case 'range':
          rangeMultiplier *= 1 + upgrade.value * 0.1; // Range is additive per upgrade
          break;
        case 'cost':
          costMultiplier *= 1 + upgrade.value;
          break;
        case 'health':
          healthBonus += upgrade.value;
          break;
        case 'guardSpecific':
          if (upgrade.targetGuard) {
            const current = guardSpecificUpgrades[upgrade.targetGuard] ?? { damage: 0, range: 0, health: 0 };
            const stat = upgrade.stat ?? 'damage';
            guardSpecificUpgrades[upgrade.targetGuard] = {
              ...current,
              [stat]: current[stat] + upgrade.value,
            };
          }
          break;
      }
    });

    // Update guards with cumulative upgrades
    const updatedGuards = state.guards.map((guard) => {
      const baseConfig = GUARD_CONFIGS[guard.type];
      const guardSpecificBonus = guardSpecificUpgrades[guard.type] ?? { damage: 0, range: 0, health: 0 };

      return {
        ...guard,
        damage: baseConfig.damage * damageMultiplier * (1 + guardSpecificBonus.damage),
        range: baseConfig.range * rangeMultiplier * (1 + guardSpecificBonus.range),
        maxHealth: baseConfig.health + healthBonus + baseConfig.health * guardSpecificBonus.health,
      };
    });

    dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });
  }, [state.upgrades, dispatch]);

  return {
    upgrades: state.upgrades,
    totalUpgrades: state.upgrades.length,
  };
}
