import { describe, expect, it } from 'vitest';
import { createAbilityRuntimeState } from './abilities';
import {
  activateAbility,
  canActivateAbility,
  updateAbilityCooldowns,
} from './abilitySystem';
import type { Guard } from './types';

function createGuard(type: Guard['type']): Guard {
  const abilityId = type === 'warrior'
    ? 'warrior-taunt'
    : type === 'archer'
      ? 'archer-arrow-rain'
      : 'tank-bulwark';

  return {
    id: `${type}-test`,
    x: 0,
    y: 0,
    plotIndex: 0,
    type,
    health: 100,
    maxHealth: 100,
    damage: 10,
    range: 32,
    attackSpeed: 1,
    attackCooldown: 0,
    color: '#fff',
    abilities: [createAbilityRuntimeState(abilityId)],
  };
}

describe('abilitySystem', () => {
  it('allows only the matching guard class to activate an ability', () => {
    const warrior = createGuard('warrior');

    expect(canActivateAbility(warrior, 'warrior-taunt')).toBe(true);
    expect(canActivateAbility(warrior, 'tank-bulwark')).toBe(false);
  });

  it('starts cooldown and active duration when an ability is activated', () => {
    const archer = createGuard('archer');
    const result = activateAbility(archer, 'archer-arrow-rain');

    expect(result?.guard.abilities?.[0].cooldownRemaining).toBe(10);
    expect(result?.guard.abilities?.[0].activeRemaining).toBe(0);
    expect(canActivateAbility(result!.guard, 'archer-arrow-rain')).toBe(false);
  });

  it('reduces timers without allowing negative values', () => {
    const tank = createGuard('tank');
    const activation = activateAbility(tank, 'tank-bulwark');
    const updated = updateAbilityCooldowns(activation!.guard, 99);

    expect(updated.abilities?.[0].cooldownRemaining).toBe(0);
    expect(updated.abilities?.[0].activeRemaining).toBe(0);
  });
});
