import type { GuardType } from './types';

export type AbilityId = 'warrior-taunt' | 'archer-arrow-rain' | 'tank-bulwark';

export type AbilityEffect =
  | {
      type: 'taunt';
      radius: number;
      threatMultiplier: number;
    }
  | {
      type: 'areaDamage';
      radius: number;
      damageMultiplier: number;
      maxTargets: number;
    }
  | {
      type: 'damageReduction';
      reductionRatio: number;
    };

export interface AbilityDefinition {
  id: AbilityId;
  guardType: GuardType;
  name: string;
  description: string;
  cooldownSeconds: number;
  durationSeconds: number;
  effect: AbilityEffect;
}

export interface AbilityRuntimeState {
  abilityId: AbilityId;
  cooldownRemaining: number;
  activeRemaining: number;
  pending: boolean;
}

export const ABILITY_CATALOG: Record<AbilityId, AbilityDefinition> = {
  'warrior-taunt': {
    id: 'warrior-taunt',
    guardType: 'warrior',
    name: 'Provocação',
    description: 'Atrai inimigos próximos e protege o farol por alguns segundos.',
    cooldownSeconds: 12,
    durationSeconds: 4,
    effect: {
      type: 'taunt',
      radius: 110,
      threatMultiplier: 4,
    },
  },
  'archer-arrow-rain': {
    id: 'archer-arrow-rain',
    guardType: 'archer',
    name: 'Chuva de Flechas',
    description: 'Dispara uma salva concentrada contra vários inimigos na área.',
    cooldownSeconds: 10,
    durationSeconds: 0,
    effect: {
      type: 'areaDamage',
      radius: 85,
      damageMultiplier: 2.2,
      maxTargets: 5,
    },
  },
  'tank-bulwark': {
    id: 'tank-bulwark',
    guardType: 'tank',
    name: 'Muralha',
    description: 'Reduz o dano recebido enquanto o tanque mantém a linha.',
    cooldownSeconds: 14,
    durationSeconds: 5,
    effect: {
      type: 'damageReduction',
      reductionRatio: 0.45,
    },
  },
};

export const ABILITY_IDS_BY_GUARD: Record<GuardType, AbilityId[]> = {
  warrior: ['warrior-taunt'],
  archer: ['archer-arrow-rain'],
  tank: ['tank-bulwark'],
};

export function getAbilityDefinition(abilityId: AbilityId): AbilityDefinition {
  return ABILITY_CATALOG[abilityId];
}

export function getAbilitiesForGuard(guardType: GuardType): AbilityDefinition[] {
  return ABILITY_IDS_BY_GUARD[guardType].map((abilityId) => getAbilityDefinition(abilityId));
}

export function createAbilityRuntimeState(abilityId: AbilityId): AbilityRuntimeState {
  return {
    abilityId,
    cooldownRemaining: 0,
    activeRemaining: 0,
    pending: false,
  };
}
