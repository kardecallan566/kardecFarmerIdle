import {
  ABILITY_CATALOG,
  type AbilityDefinition,
  type AbilityEffect,
  type AbilityId,
  type AbilityRuntimeState,
} from './abilities';
import type { Guard } from './types';

export interface AbilityActivationResult {
  guard: Guard;
  definition: AbilityDefinition;
  effect: AbilityEffect;
}

function getRuntimeState(guard: Guard, abilityId: AbilityId): AbilityRuntimeState | undefined {
  return guard.abilities?.find((ability) => ability.abilityId === abilityId);
}

export function canActivateAbility(guard: Guard, abilityId: AbilityId): boolean {
  const definition = ABILITY_CATALOG[abilityId];
  const runtimeState = getRuntimeState(guard, abilityId);

  return Boolean(
    definition &&
      definition.guardType === guard.type &&
      runtimeState &&
      runtimeState.cooldownRemaining <= 0,
  );
}

export function activateAbility(guard: Guard, abilityId: AbilityId): AbilityActivationResult | null {
  if (!canActivateAbility(guard, abilityId)) return null;

  const definition = ABILITY_CATALOG[abilityId];
  const abilities = (guard.abilities ?? []).map((ability) =>
    ability.abilityId === abilityId
      ? {
          ...ability,
          cooldownRemaining: definition.cooldownSeconds,
          activeRemaining: definition.durationSeconds,
          pending: definition.effect.type === 'areaDamage',
        }
      : ability,
  );

  return {
    guard: { ...guard, abilities },
    definition,
    effect: definition.effect,
  };
}

export function consumePendingAbility(guard: Guard, abilityId: AbilityId): Guard {
  if (!guard.abilities?.some((ability) => ability.abilityId === abilityId && ability.pending)) return guard;

  return {
    ...guard,
    abilities: guard.abilities.map((ability) =>
      ability.abilityId === abilityId ? { ...ability, pending: false } : ability,
    ),
  };
}

export function updateAbilityCooldowns(guard: Guard, deltaSeconds: number): Guard {
  if (!guard.abilities?.length || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return guard;

  return {
    ...guard,
    abilities: guard.abilities.map((ability) => ({
      ...ability,
      cooldownRemaining: Math.max(0, ability.cooldownRemaining - deltaSeconds),
      activeRemaining: Math.max(0, ability.activeRemaining - deltaSeconds),
    })),
  };
}

export function isAbilityActive(guard: Guard, abilityId: AbilityId): boolean {
  return (getRuntimeState(guard, abilityId)?.activeRemaining ?? 0) > 0;
}

export function getActiveAbilityDefinitions(guard: Guard): AbilityDefinition[] {
  return (guard.abilities ?? [])
    .filter((ability) => ability.activeRemaining > 0)
    .map((ability) => ABILITY_CATALOG[ability.abilityId]);
}
