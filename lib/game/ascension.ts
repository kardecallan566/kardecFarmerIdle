export interface AscensionEffects {
  damageMultiplier: number;
  healthMultiplier: number;
  combatCoinMultiplier: number;
  plantationHealthMultiplier: number;
}

export function getAscensionCost(level: number): number {
  return 8 + Math.max(0, level) * 6;
}

export function getAscensionRequirement(level: number): number {
  return 10 + Math.max(0, level) * 5;
}

export function getAscensionEssenceReward(wave: number): number {
  return Math.max(1, Math.floor(Math.max(1, wave) / 5));
}

export function getAscensionEffects(level: number): AscensionEffects {
  const safeLevel = Math.max(0, level);
  return {
    damageMultiplier: 1 + Math.min(0.5, safeLevel * 0.025),
    healthMultiplier: 1 + Math.min(0.4, safeLevel * 0.02),
    combatCoinMultiplier: 1 + Math.min(0.3, safeLevel * 0.015),
    plantationHealthMultiplier: 1 + Math.min(0.35, safeLevel * 0.02),
  };
}
