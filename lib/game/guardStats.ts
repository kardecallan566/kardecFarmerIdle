import { getBarracksModifiers } from './formations';
import type { CropPlot, FormationId, GuardType, Upgrade } from './types';
import { getGuardStats } from './types';

export function getRunGuardStats(
  type: GuardType,
  persistentLevel: number,
  upgrades: Upgrade[],
  plots: CropPlot[],
  plotIndex: number,
  formation: FormationId,
) {
  const base = getGuardStats(type, persistentLevel);
  let damageMultiplier = 1;
  let rangeMultiplier = 1;
  let healthBonus = 0;
  let specificDamage = 0;
  let specificRange = 0;
  let specificHealth = 0;

  upgrades.forEach((upgrade) => {
    if (upgrade.type === 'damage') damageMultiplier *= 1 + upgrade.value;
    if (upgrade.type === 'range') rangeMultiplier *= 1 + upgrade.value * 0.1;
    if (upgrade.type === 'health') healthBonus += upgrade.value;
    if (upgrade.type === 'guardSpecific' && upgrade.targetGuard === type) {
      const stat = upgrade.stat ?? 'damage';
      if (stat === 'damage') specificDamage += upgrade.value;
      if (stat === 'range') specificRange += upgrade.value;
      if (stat === 'health') specificHealth += upgrade.value;
    }
  });

  const barracks = getBarracksModifiers(plotIndex, type, plots, formation);

  return {
    ...base,
    damage: base.damage * damageMultiplier * (1 + specificDamage) * barracks.damageMultiplier,
    range: base.range * rangeMultiplier * (1 + specificRange) * barracks.rangeMultiplier,
    health: (base.health + healthBonus + base.health * specificHealth) * barracks.healthMultiplier,
    attackSpeed: base.attackSpeed * barracks.attackSpeedMultiplier,
  };
}
