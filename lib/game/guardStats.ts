import { getBarracksModifiers } from './formations';
import { getAscensionEffects } from './ascension';
import { getTechnologyEffects } from './technology';
import type { CropPlot, FormationId, GuardType, Upgrade } from './types';
import { getGuardStats } from './types';

export function getRunGuardStats(
  type: GuardType,
  persistentLevel: number,
  upgrades: Upgrade[],
  plots: CropPlot[],
  plotIndex: number,
  formation: FormationId,
  ascensionLevel = 0,
  technologyLevels = { combatDoctrine: 0, supplyLines: 0, forestWard: 0 },
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

  const assaultStacks = upgrades.filter((upgrade) => upgrade.behavior === 'assault').length;
  const bastionStacks = upgrades.filter((upgrade) => upgrade.behavior === 'bastion').length;
  const precisionStacks = upgrades.filter((upgrade) => upgrade.behavior === 'precision').length;
  damageMultiplier *= 1 + Math.min(0.25, assaultStacks * 0.03);
  rangeMultiplier *= 1 + Math.min(0.2, precisionStacks * 0.04);
  healthBonus += Math.min(30, bastionStacks * 3);

  const barracks = getBarracksModifiers(plotIndex, type, plots, formation);
  const ascensionEffects = getAscensionEffects(ascensionLevel);
  const technologyEffects = getTechnologyEffects(technologyLevels);

  return {
    ...base,
    damage: base.damage * damageMultiplier * (1 + specificDamage) * barracks.damageMultiplier * technologyEffects.damageMultiplier * ascensionEffects.damageMultiplier,
    range: base.range * rangeMultiplier * (1 + specificRange) * barracks.rangeMultiplier,
    health: (base.health + healthBonus + base.health * specificHealth) * barracks.healthMultiplier * technologyEffects.guardHealthMultiplier * ascensionEffects.healthMultiplier,
    attackSpeed: base.attackSpeed * barracks.attackSpeedMultiplier * (1 + Math.min(0.12, precisionStacks * 0.03)),
  };
}
