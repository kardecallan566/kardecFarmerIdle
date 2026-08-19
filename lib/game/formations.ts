import type { FormationId, GuardType, CropPlot } from './types';

export interface FormationDefinition {
  id: FormationId;
  name: string;
  description: string;
}

export interface BarracksModifiers {
  damageMultiplier: number;
  healthMultiplier: number;
  rangeMultiplier: number;
  attackSpeedMultiplier: number;
}

export const FORMATION_CATALOG: Record<FormationId, FormationDefinition> = {
  balanced: {
    id: 'balanced',
    name: 'Linha Equilibrada',
    description: 'Distribui pequenos bônus por todas as classes.',
  },
  frontline: {
    id: 'frontline',
    name: 'Muralha da Vila',
    description: 'Guerreiros e tanques seguram o anel; arqueiros ganham alcance.',
  },
  crossfire: {
    id: 'crossfire',
    name: 'Fogo Cruzado',
    description: 'Arqueiros amplificam dano quando cercados por classes diferentes.',
  },
};

const EMPTY_MODIFIERS: BarracksModifiers = {
  damageMultiplier: 1,
  healthMultiplier: 1,
  rangeMultiplier: 1,
  attackSpeedMultiplier: 1,
};

function getNeighborPlots(plotIndex: number, plots: CropPlot[]): CropPlot[] {
  const plotCount = plots.length;
  if (plotCount === 0) return [];

  const previousIndex = (plotIndex - 1 + plotCount) % plotCount;
  const nextIndex = (plotIndex + 1) % plotCount;
  return plots.filter((plot) => plot.index === previousIndex || plot.index === nextIndex);
}

export function getBarracksModifiers(
  plotIndex: number,
  guardType: GuardType,
  plots: CropPlot[],
  formation: FormationId,
): BarracksModifiers {
  const plot = plots.find((candidate) => candidate.index === plotIndex);
  if (!plot?.cropType) return EMPTY_MODIFIERS;

  const neighbors = getNeighborPlots(plotIndex, plots).filter((neighbor) => neighbor.cropType);
  const sameTypeNeighbors = neighbors.filter((neighbor) => neighbor.cropType === guardType).length;
  const mixedNeighbors = neighbors.filter((neighbor) => neighbor.cropType && neighbor.cropType !== guardType).length;
  const activePlotCount = plots.filter((candidate) => candidate.cropType).length;

  const modifiers: BarracksModifiers = {
    ...EMPTY_MODIFIERS,
    damageMultiplier: 1 + Math.min(0.1, sameTypeNeighbors * 0.05),
    healthMultiplier: 1 + Math.min(0.08, activePlotCount * 0.01),
    rangeMultiplier: 1 + Math.min(0.08, mixedNeighbors * 0.04),
    attackSpeedMultiplier: 1,
  };

  if (formation === 'frontline') {
    if (guardType === 'warrior' || guardType === 'tank') {
      modifiers.healthMultiplier += 0.12;
      modifiers.damageMultiplier += 0.06;
    } else {
      modifiers.rangeMultiplier += 0.08;
    }
  }

  if (formation === 'crossfire') {
    if (guardType === 'archer') {
      modifiers.damageMultiplier += Math.min(0.2, mixedNeighbors * 0.1);
      modifiers.attackSpeedMultiplier += 0.06;
    } else if (mixedNeighbors > 0) {
      modifiers.rangeMultiplier += 0.06;
    }
  }

  return modifiers;
}

export function getFormationDefinition(formation: FormationId): FormationDefinition {
  return FORMATION_CATALOG[formation];
}
