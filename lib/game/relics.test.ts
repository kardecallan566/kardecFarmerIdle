import { describe, expect, it } from 'vitest';
import { generateUpgradeOptions } from './utils';
import { getRelicBehaviorLabel, getRelicRarityConfig } from './relics';


describe('relic rewards', () => {
  it('generates unique relic options with rarity and behavior metadata', () => {
    const options = generateUpgradeOptions(3);

    expect(options).toHaveLength(3);
    expect(new Set(options.map((option) => option.id)).size).toBe(3);
    options.forEach((option) => {
      expect(option.rarity).toBeDefined();
      expect(option.behavior).toBeDefined();
      expect(option.description.length).toBeGreaterThan(0);
    });
  });

  it('exposes stable labels and colors for every rarity and behavior', () => {
    expect(getRelicRarityConfig('legendary').label).toBe('LENDÁRIA');
    expect(getRelicRarityConfig('epic').color).toMatch(/^#/);
    expect(getRelicBehaviorLabel('precision')).toBe('PRECISION');
  });
});
