import type { BossAbilityType } from './types';

export interface BossPhaseDefinition {
  phase: number;
  name: string;
  minHealthRatio: number;
  accentColor: string;
  availableAbilities: BossAbilityType[];
}

export const BOSS_PHASES: BossPhaseDefinition[] = [
  {
    phase: 1,
    name: 'Vigia',
    minHealthRatio: 0.67,
    accentColor: '#E7A93B',
    availableAbilities: ['speedBoost'],
  },
  {
    phase: 2,
    name: 'Investida',
    minHealthRatio: 0.34,
    accentColor: '#FF7B4D',
    availableAbilities: ['speedBoost', 'spawnMinions'],
  },
  {
    phase: 3,
    name: 'Colapso',
    minHealthRatio: 0,
    accentColor: '#C36BFF',
    availableAbilities: ['speedBoost', 'spawnMinions', 'shockwave'],
  },
];

export function getBossPhase(health: number, maxHealth: number): BossPhaseDefinition {
  const healthRatio = maxHealth > 0 ? health / maxHealth : 0;
  return BOSS_PHASES.find((phase) => healthRatio >= phase.minHealthRatio) ?? BOSS_PHASES[BOSS_PHASES.length - 1];
}

export function getBossPhaseByNumber(phaseNumber: number): BossPhaseDefinition {
  return BOSS_PHASES[Math.min(BOSS_PHASES.length - 1, Math.max(0, phaseNumber - 1))];
}
