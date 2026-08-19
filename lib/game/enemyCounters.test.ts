import { describe, expect, it } from 'vitest';
import { getCounterDamageMultiplier } from './enemyCounters';
import { getEnemyKindForSpawn, getEnemyProfile } from './types';

describe('enemy classes', () => {
  it('unlocks the new classes progressively by wave', () => {
    expect(getEnemyKindForSpawn(3, 4)).toBe('runner');
    expect(getEnemyKindForSpawn(4, 6)).toBe('flyer');
    expect(getEnemyKindForSpawn(5, 8)).toBe('demolisher');
    expect(getEnemyKindForSpawn(7, 9)).toBe('summoner');
    expect(getEnemyKindForSpawn(8, 11)).toBe('wraith');
  });

  it('gives each class a distinct traversal or pressure profile', () => {
    expect(getEnemyProfile('flyer', 8).traversal).toBe('flying');
    expect(getEnemyProfile('wraith', 8).traversal).toBe('wraith');
    expect(getEnemyProfile('demolisher', 8).plantationDamageMultiplier).toBeGreaterThan(2);
    expect(getEnemyProfile('summoner', 8).health).toBeGreaterThan(getEnemyProfile('normal', 8).health);
  });

  it('rewards the intended counter classes', () => {
    expect(getCounterDamageMultiplier('archer', 'flyer')).toBeGreaterThan(1.5);
    expect(getCounterDamageMultiplier('warrior', 'demolisher')).toBeGreaterThan(1.3);
    expect(getCounterDamageMultiplier('tank', 'wraith')).toBeGreaterThan(1.3);
  });
});
