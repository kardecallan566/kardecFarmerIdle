import type {
  GuardType,
  RelicBehavior,
  RelicRarity,
  Upgrade,
} from './types';

export interface RelicTemplate {
  templateId: string;
  name: string;
  description: string;
  type: Upgrade['type'];
  value: number;
  targetGuard?: GuardType;
  stat?: Upgrade['stat'];
  rarity: RelicRarity;
  behavior: RelicBehavior;
  weight: number;
}

export const RELIC_RARITY_CONFIG: Record<RelicRarity, { label: string; color: string }> = {
  common: { label: 'COMUM', color: '#70816F' },
  rare: { label: 'RARA', color: '#3C87C7' },
  epic: { label: 'ÉPICA', color: '#8B5AC2' },
  legendary: { label: 'LENDÁRIA', color: '#C48A2B' },
};

export const RELIC_BEHAVIOR_LABELS: Record<RelicBehavior, string> = {
  assault: 'ASSAULT',
  bastion: 'BASTION',
  precision: 'PRECISION',
  logistics: 'LOGISTICS',
};

export const RELIC_CATALOG: RelicTemplate[] = [
  {
    templateId: 'damage-common',
    name: '+15% Dano',
    description: 'Todas as tropas causam mais dano.',
    type: 'damage',
    value: 0.15,
    rarity: 'common',
    behavior: 'assault',
    weight: 10,
  },
  {
    templateId: 'damage-rare',
    name: '+30% Dano',
    description: 'As tropas pressionam a linha inimiga com força.',
    type: 'damage',
    value: 0.3,
    rarity: 'rare',
    behavior: 'assault',
    weight: 6,
  },
  {
    templateId: 'damage-epic',
    name: '+48% Dano',
    description: 'Uma relíquia agressiva para runs de alto risco.',
    type: 'damage',
    value: 0.48,
    rarity: 'epic',
    behavior: 'assault',
    weight: 3,
  },
  {
    templateId: 'range-common',
    name: '+1 Alcance',
    description: 'Todas as tropas cobrem um raio maior.',
    type: 'range',
    value: 1,
    rarity: 'common',
    behavior: 'precision',
    weight: 10,
  },
  {
    templateId: 'range-rare',
    name: '+2 Alcance',
    description: 'A defesa enxerga ameaças antes de elas chegarem ao anel.',
    type: 'range',
    value: 2,
    rarity: 'rare',
    behavior: 'precision',
    weight: 6,
  },
  {
    templateId: 'cost-common',
    name: '-15% Custo',
    description: 'Reduz o custo de invocar tropas durante a run.',
    type: 'cost',
    value: -0.15,
    rarity: 'common',
    behavior: 'logistics',
    weight: 9,
  },
  {
    templateId: 'cost-rare',
    name: '-25% Custo',
    description: 'Transforma suprimentos em uma economia de longo prazo.',
    type: 'cost',
    value: -0.25,
    rarity: 'rare',
    behavior: 'logistics',
    weight: 5,
  },
  {
    templateId: 'supplies-common',
    name: '+30% Suprimentos',
    description: 'Cada inimigo derrotado rende mais suprimentos de combate.',
    type: 'combatCoins',
    value: 0.3,
    rarity: 'common',
    behavior: 'logistics',
    weight: 9,
  },
  {
    templateId: 'supplies-epic',
    name: '+70% Suprimentos',
    description: 'Uma reserva abundante para composições que invocam sem parar.',
    type: 'combatCoins',
    value: 0.7,
    rarity: 'epic',
    behavior: 'logistics',
    weight: 3,
  },
  {
    templateId: 'health-common',
    name: '+12 Vida',
    description: 'Aumenta a vida máxima de todas as tropas.',
    type: 'health',
    value: 12,
    rarity: 'common',
    behavior: 'bastion',
    weight: 10,
  },
  {
    templateId: 'health-rare',
    name: '+25 Vida',
    description: 'A linha defensiva aguenta mais ataques antes de recuar.',
    type: 'health',
    value: 25,
    rarity: 'rare',
    behavior: 'bastion',
    weight: 6,
  },
  {
    templateId: 'warrior-assault',
    name: 'Guerreiro +35% Dano',
    description: 'Fortalece apenas guerreiros e combina com a linha de frente.',
    type: 'guardSpecific',
    value: 0.35,
    targetGuard: 'warrior',
    stat: 'damage',
    rarity: 'rare',
    behavior: 'assault',
    weight: 5,
  },
  {
    templateId: 'archer-precision',
    name: 'Arqueiro +45% Alcance',
    description: 'Arqueiros dominam as rotas externas de longe.',
    type: 'guardSpecific',
    value: 0.45,
    targetGuard: 'archer',
    stat: 'range',
    rarity: 'rare',
    behavior: 'precision',
    weight: 5,
  },
  {
    templateId: 'tank-bastion',
    name: 'Tanque +55% Vida',
    description: 'Tanques se tornam âncoras para formações de Muralha.',
    type: 'guardSpecific',
    value: 0.55,
    targetGuard: 'tank',
    stat: 'health',
    rarity: 'rare',
    behavior: 'bastion',
    weight: 5,
  },
];

export function getRelicRarityConfig(rarity: RelicRarity) {
  return RELIC_RARITY_CONFIG[rarity];
}

export function getRelicBehaviorLabel(behavior: RelicBehavior): string {
  return RELIC_BEHAVIOR_LABELS[behavior];
}
