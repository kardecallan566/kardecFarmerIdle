import { describe, expect, it } from 'vitest';
import { getBossPhase, getBossPhaseByNumber } from './bossPhases';

describe('boss phases', () => {
  it('moves from watch to assault and collapse at health thresholds', () => {
    expect(getBossPhase(100, 100).phase).toBe(1);
    expect(getBossPhase(66, 100).phase).toBe(2);
    expect(getBossPhase(33, 100).phase).toBe(3);
  });

  it('clamps phase lookup to the final phase', () => {
    expect(getBossPhaseByNumber(99).name).toBe('Colapso');
  });
});
