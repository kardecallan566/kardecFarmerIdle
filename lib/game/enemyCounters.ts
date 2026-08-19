import type { EnemyKind, GuardType } from './types';

export function getCounterDamageMultiplier(guardType: GuardType, enemyKind: EnemyKind): number {
  if (enemyKind === 'flyer' && guardType === 'archer') return 1.65;
  if (enemyKind === 'demolisher' && guardType === 'warrior') return 1.45;
  if (enemyKind === 'summoner' && guardType === 'archer') return 1.35;
  if (enemyKind === 'wraith' && guardType === 'tank') return 1.4;
  if (enemyKind === 'healer' && guardType === 'warrior') return 1.2;
  return 1;
}

export const ENEMY_CLASS_LABELS: Record<EnemyKind, string> = {
  normal: 'NORMAL',
  runner: 'CORREDOR',
  brute: 'BRUTO',
  healer: 'CURANDEIRO',
  flyer: 'VOADOR',
  demolisher: 'DEMOLIDOR',
  summoner: 'INVOCADOR',
  wraith: 'ESPECTRO',
  boss: 'BOSS',
};
