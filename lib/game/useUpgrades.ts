import { useEffect } from 'react';
import { useGame } from './GameContext';
import { getRunGuardStats } from './guardStats';

export function useUpgrades() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.guards.length === 0) return;

    const updatedGuards = state.guards.map((guard) => {
      const stats = getRunGuardStats(
        guard.type,
        state.troopUpgradeLevels[guard.type],
        state.upgrades,
        state.plots,
        guard.plotIndex,
        state.formation,
      );
      const healthRatio = guard.maxHealth > 0 ? guard.health / guard.maxHealth : 1;

      return {
        ...guard,
        damage: stats.damage,
        range: stats.range,
        attackSpeed: stats.attackSpeed,
        maxHealth: stats.health,
        health: Math.min(stats.health, stats.health * healthRatio),
      };
    });

    const hasStatChange = updatedGuards.some((guard, index) => {
      const previous = state.guards[index];
      return (
        guard.damage !== previous.damage ||
        guard.range !== previous.range ||
        guard.attackSpeed !== previous.attackSpeed ||
        guard.maxHealth !== previous.maxHealth ||
        guard.health !== previous.health
      );
    });

    if (hasStatChange) {
      dispatch({ type: 'UPDATE_GUARDS', guards: updatedGuards });
    }
  }, [state.formation, state.guards, state.plots, state.troopUpgradeLevels, state.upgrades, dispatch]);

  return {
    upgrades: state.upgrades,
    totalUpgrades: state.upgrades.length,
  };
}
