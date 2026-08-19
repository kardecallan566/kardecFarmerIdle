import type { TechnologyId, TechnologyLevels } from './types';

export interface TechnologyNode {
  id: TechnologyId;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costStep: number;
}

export interface TechnologyEffects {
  damageMultiplier: number;
  combatCoinMultiplier: number;
  combatCostMultiplier: number;
  guardHealthMultiplier: number;
  plantationHealthMultiplier: number;
}

export const TECHNOLOGY_CATALOG: TechnologyNode[] = [
  {
    id: 'combatDoctrine',
    name: 'Doutrina de Combate',
    description: 'Aumenta o dano base de todas as tropas.',
    maxLevel: 5,
    baseCost: 240,
    costStep: 180,
  },
  {
    id: 'supplyLines',
    name: 'Linhas de Suprimento',
    description: 'Reduz o custo das cartas e rende mais suprimentos por abate.',
    maxLevel: 5,
    baseCost: 260,
    costStep: 200,
  },
  {
    id: 'forestWard',
    name: 'Guarda da Floresta',
    description: 'Aumenta a vida das tropas e a resistência do farol.',
    maxLevel: 5,
    baseCost: 280,
    costStep: 220,
  },
];

export const DEFAULT_TECHNOLOGY_LEVELS: TechnologyLevels = {
  combatDoctrine: 0,
  supplyLines: 0,
  forestWard: 0,
};

export function getTechnologyNode(id: TechnologyId): TechnologyNode {
  return TECHNOLOGY_CATALOG.find((node) => node.id === id) ?? TECHNOLOGY_CATALOG[0];
}

export function getTechnologyCost(id: TechnologyId, level: number): number {
  const node = getTechnologyNode(id);
  return node.baseCost + Math.max(0, level) * node.costStep;
}

export function getTechnologyEffects(levels: TechnologyLevels): TechnologyEffects {
  return {
    damageMultiplier: 1 + Math.min(0.35, levels.combatDoctrine * 0.07),
    combatCoinMultiplier: 1 + Math.min(0.3, levels.supplyLines * 0.06),
    combatCostMultiplier: 1 - Math.min(0.2, levels.supplyLines * 0.04),
    guardHealthMultiplier: 1 + Math.min(0.3, levels.forestWard * 0.06),
    plantationHealthMultiplier: 1 + Math.min(0.25, levels.forestWard * 0.05),
  };
}
