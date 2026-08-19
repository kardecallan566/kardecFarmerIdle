import { describe, expect, it } from 'vitest';
import { getBarracksModifiers } from './formations';
import type { CropPlot } from './types';

function plot(index: number, cropType: CropPlot['cropType']): CropPlot {
  return {
    id: `plot_${index}`,
    index,
    name: `Quartel ${index}`,
    angleStart: 0,
    angleEnd: 0,
    cropType,
    cropLevel: cropType ? 1 : 0,
    unlocked: true,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  };
}

describe('formations', () => {
  it('rewards same-class neighbors with a bounded damage bonus', () => {
    const plots = [
      plot(0, 'warrior'),
      plot(1, 'warrior'),
      plot(2, 'warrior'),
      plot(3, null),
    ];
    const modifiers = getBarracksModifiers(1, 'warrior', plots, 'balanced');

    expect(modifiers.damageMultiplier).toBe(1.1);
    expect(modifiers.healthMultiplier).toBeGreaterThan(1);
  });

  it('strengthens frontline classes in the frontline formation', () => {
    const plots = [plot(0, 'warrior'), plot(1, 'tank'), plot(2, 'archer')];
    const modifiers = getBarracksModifiers(0, 'warrior', plots, 'frontline');

    expect(modifiers.healthMultiplier).toBeGreaterThan(1.1);
    expect(modifiers.damageMultiplier).toBeGreaterThan(1.05);
  });

  it('turns mixed neighbors into archer crossfire power', () => {
    const plots = [plot(0, 'tank'), plot(1, 'archer'), plot(2, 'warrior')];
    const modifiers = getBarracksModifiers(1, 'archer', plots, 'crossfire');

    expect(modifiers.damageMultiplier).toBeGreaterThan(1.15);
    expect(modifiers.attackSpeedMultiplier).toBeGreaterThan(1);
  });
});
