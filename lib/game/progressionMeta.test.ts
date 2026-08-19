import { describe, expect, it } from 'vitest';
import { getAscensionCost, getAscensionEffects, getAscensionRequirement } from './ascension';
import { getTechnologyCost, getTechnologyEffects } from './technology';
import { getRunEventForWave, resolveRunEvent } from './runEvents';

describe('meta progression', () => {
  it('scales technology costs and effects with level', () => {
    expect(getTechnologyCost('combatDoctrine', 1)).toBeGreaterThan(getTechnologyCost('combatDoctrine', 0));
    expect(getTechnologyEffects({ combatDoctrine: 3, supplyLines: 2, forestWard: 1 }).damageMultiplier).toBeGreaterThan(1);
    expect(getTechnologyEffects({ combatDoctrine: 3, supplyLines: 2, forestWard: 1 }).combatCostMultiplier).toBeLessThan(1);
  });

  it('requires both wave progress and essence for Ascension', () => {
    expect(getAscensionRequirement(0)).toBe(10);
    expect(getAscensionCost(1)).toBeGreaterThan(getAscensionCost(0));
    expect(getAscensionEffects(4).damageMultiplier).toBeGreaterThan(1);
  });

  it('offers events only on selected post-boss milestones', () => {
    expect(getRunEventForWave(5)).toBeNull();
    expect(getRunEventForWave(6)?.id).toBe('scavenger');
    expect(resolveRunEvent('scavenger', 'stockpile').combatCoinsDelta).toBe(120);
    expect(resolveRunEvent('lastStand', 'ambush').plantationHealthDelta).toBe(-18);
  });
});
