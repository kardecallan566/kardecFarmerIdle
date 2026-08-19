import type { AbilityRuntimeState } from './abilities';

export type GuardType = 'warrior' | 'archer' | 'tank';
export type BeaconUpgradeType = 'lightSpeed' | 'multiSpawn' | 'extraSlots';
export type EnemyKind = 'normal' | 'runner' | 'brute' | 'healer' | 'boss';
export type EnemySkinTier = 'wild' | 'scarred' | 'ancient' | 'apocalypse';
export type GuardVisualTier = 'base' | 'veteran' | 'elite' | 'legendary';
export type FormationId = 'balanced' | 'frontline' | 'crossfire';

export const CURRENT_SAVE_VERSION = 2;

export interface BeaconUpgradeLevels {
  lightSpeed: number;
  multiSpawn: number;
  extraSlots: number;
}

export interface BestiaryProgress {
  normal: number;
  runner: number;
  brute: number;
  healer: number;
  boss: number;
}

export interface GuardVisualProfile {
  tier: GuardVisualTier;
  assetKey: string;
  title: string;
  badge: string;
  armorColor: string;
  accentColor: string;
  auraColor: string;
}

export const DEFAULT_BEACON_UPGRADE_LEVELS: BeaconUpgradeLevels = {
  lightSpeed: 0,
  multiSpawn: 0,
  extraSlots: 0,
};

export const DEFAULT_BESTIARY_PROGRESS: BestiaryProgress = {
  normal: 0,
  runner: 0,
  brute: 0,
  healer: 0,
  boss: 0,
};

export interface PersistentProgress {
  saveVersion: number;
  bankGold: number;
  unlockedTroops: GuardType[];
  troopUpgradeLevels: Record<GuardType, number>;
  beaconUpgradeLevels: BeaconUpgradeLevels;
  idleUpgradeLevel: number;
  lastOnlineAt: number;
  bestiaryDefeated: BestiaryProgress;
  bestWave: number;
  totalGames: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface CropPlot {
  id: string;
  index: number;
  name: string;
  angleStart: number;
  angleEnd: number;
  cropType: GuardType | null;
  cropLevel: number;
  unlocked: boolean;
  x: number;
  y: number;
  isWateredThisCycle: boolean;
}

export interface SprinklerState {
  angle: number;
  rotationSpeed: number;
}

export interface GameState {
  wave: number;
  combatCoins: number;
  plantationHealth: number;
  maxPlantationHealth: number;
  gameActive: boolean;
  gameLost: boolean;
  enemies: Enemy[];
  guards: Guard[];
  plots: CropPlot[];
  sprinkler: SprinklerState;
  selectedPlotIndex: number | null;
  waveEnemiesRemaining: number;
  waveEnemiesTotal: number;
  waveEnemiesSpawned: number;
  totalEnemiesDefeated: number;
  totalCombatCoinsEarned: number;
  upgrades: Upgrade[];
  pendingWaveRewards: Upgrade[];
  selectedCardIndex: number | null;
  placingMode: boolean;
  formation: FormationId;
  bankGold: number;
  unlockedTroops: GuardType[];
  troopUpgradeLevels: Record<GuardType, number>;
  beaconUpgradeLevels: BeaconUpgradeLevels;
  idleUpgradeLevel: number;
  idleGoldAvailable: number;
  lastOnlineAt: number;
  bestiaryDefeated: BestiaryProgress;
  bestWave: number;
  totalGames: number;
  progressLoaded: boolean;
  runRewardClaimed: boolean;
  lastRunReward: number;
}

export interface Enemy {
  id: string;
  kind: EnemyKind;
  skinTier: EnemySkinTier;
  bossEra: number;
  x: number;
  y: number;
  pathIndex: number;
  pathProgress: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  troopDamage: number;
  radius: number;
  color: string;
  isBoss: boolean;
  healingPower?: number;
  abilityCooldown?: number;
  bossAbilities?: BossAbility[];
  attackCooldown?: number;
}

export interface BossAbility {
  type: 'speedBoost' | 'spawnMinions';
  cooldown: number;
  maxCooldown: number;
}

export interface Guard {
  id: string;
  x: number;
  y: number;
  plotIndex: number;
  type: GuardType;
  health: number;
  maxHealth: number;
  damage: number;
  range: number;
  attackSpeed: number;
  attackCooldown: number;
  moveSpeed?: number;
  color: string;
  targetId?: string;
  abilities?: AbilityRuntimeState[];
}

export interface Card {
  id: string;
  type: GuardType;
  combatCost: number;
  cooldown: number;
  maxCooldown: number;
  available: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: 'damage' | 'range' | 'cost' | 'combatCoins' | 'health' | 'guardSpecific';
  value: number;
  targetGuard?: GuardType;
  stat?: 'damage' | 'range' | 'health';
}

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  enemyHealth: number;
  enemySpeed: number;
  enemyDamage: number;
  troopDamage: number;
  isBossWave: boolean;
}

export interface EnemyProfile {
  kind: EnemyKind;
  skinTier: EnemySkinTier;
  bossEra: number;
  health: number;
  speed: number;
  damage: number;
  troopDamage: number;
  radius: number;
  color: string;
  healingPower?: number;
}

export interface GameConfig {
  mapRadius: number;
  plantationRadius: number;
  pathCount: number;
  spawnDistance: number;
  combatCoinsPerSecond: number;
  combatCoinsPerKill: number;
  initialPlantationHealth: number;
  waveInterval: number;
}

export const GUARD_CONFIGS = {
  warrior: {
    combatCost: 100,
    health: 50,
    damage: 15,
    range: 32,
    attackSpeed: 1.0,
    moveSpeed: 40,
    color: '#4169E1',
    name: 'Guerreiro',
    cropName: 'Trigo de Guerra',
  },
  archer: {
    combatCost: 120,
    health: 30,
    damage: 12,
    range: 160,
    attackSpeed: 1.4,
    moveSpeed: 46,
    color: '#32CD32',
    name: 'Arqueiro',
    cropName: 'Milho de Arco',
  },
  tank: {
    combatCost: 150,
    health: 100,
    damage: 8,
    range: 70,
    attackSpeed: 0.6,
    moveSpeed: 28,
    color: '#A9A9A9',
    name: 'Tanque',
    cropName: 'Abóbora Blindada',
  },
} satisfies Record<GuardType, {
  combatCost: number;
  health: number;
  damage: number;
  range: number;
  attackSpeed: number;
  moveSpeed: number;
  color: string;
  name: string;
  cropName: string;
}>;

export function getCombatCostMultiplier(upgrades: Upgrade[] = []): number {
  return upgrades
    .filter((upgrade) => upgrade.type === 'cost')
    .reduce((multiplier, upgrade) => multiplier * Math.max(0, 1 + upgrade.value), 1);
}

export function getEffectiveCombatCost(type: GuardType, upgrades: Upgrade[] = []): number {
  const baseCost = GUARD_CONFIGS[type].combatCost;
  return Math.max(0, Math.round(baseCost * getCombatCostMultiplier(upgrades)));
}

export function getGuardStats(type: GuardType, upgradeLevel = 0) {
  const base = GUARD_CONFIGS[type];
  const levelMultiplier = 1 + Math.max(0, upgradeLevel) * 0.12;
  return {
    ...base,
    health: Math.round(base.health * levelMultiplier),
    damage: Math.round(base.damage * levelMultiplier),
    range: base.range,
  };
}

export function getGuardVisualProfile(type: GuardType, upgradeLevel = 0): GuardVisualProfile {
  const tier: GuardVisualTier = upgradeLevel >= 6
    ? 'legendary'
    : upgradeLevel >= 4
      ? 'elite'
      : upgradeLevel >= 2
        ? 'veteran'
        : 'base';
  const palettes: Record<GuardVisualTier, Omit<GuardVisualProfile, 'tier' | 'assetKey'>> = {
    base: {
      title: 'Recruta',
      badge: 'I',
      armorColor: '#4169E1',
      accentColor: '#C9E6FF',
      auraColor: '#8DCB63',
    },
    veteran: {
      title: 'Veterano',
      badge: 'II',
      armorColor: '#B36B2C',
      accentColor: '#FFE0A3',
      auraColor: '#F2B84B',
    },
    elite: {
      title: 'Elite',
      badge: 'III',
      armorColor: '#7B3FB5',
      accentColor: '#F1C8FF',
      auraColor: '#C98AF2',
    },
    legendary: {
      title: 'Lendário',
      badge: 'IV',
      armorColor: '#B78A24',
      accentColor: '#FFF3A8',
      auraColor: '#F7D774',
    },
  };
  return {
    tier,
    assetKey: `${type}-${tier}`,
    ...palettes[tier],
  };
}

export function getBeaconStats(levels: BeaconUpgradeLevels = DEFAULT_BEACON_UPGRADE_LEVELS) {
  const lightSpeedLevel = Math.min(5, Math.max(0, levels.lightSpeed));
  const multiSpawnLevel = Math.min(2, Math.max(0, levels.multiSpawn));
  const extraSlotsLevel = Math.min(4, Math.max(0, levels.extraSlots));

  return {
    rotationSpeed: (Math.PI / 2) * (1 + lightSpeedLevel * 0.2),
    spawnBatch: 1 + multiSpawnLevel,
    unlockedPlotCount: 4 + extraSlotsLevel,
  };
}

export function getIdleGoldRate(idleUpgradeLevel: number): number {
  return 2 + Math.min(5, Math.max(0, idleUpgradeLevel)) * 2;
}

export function getIdleUpgradeCost(idleUpgradeLevel: number): number {
  return 500 + Math.min(5, Math.max(0, idleUpgradeLevel)) * 450;
}

export function getOfflineGold(lastOnlineAt: number, now = Date.now(), idleUpgradeLevel = 0): number {
  if (!lastOnlineAt || lastOnlineAt > now) return 0;
  const elapsedMinutes = Math.min(8 * 60, Math.max(0, now - lastOnlineAt) / 60000);
  return Math.floor(elapsedMinutes * getIdleGoldRate(idleUpgradeLevel));
}

export function getBestiaryReward(kind: EnemyKind, previousCount: number, nextCount: number): number {
  let reward = previousCount === 0 && nextCount > 0 ? 40 : 0;
  const milestoneRewards: Record<number, number> = { 10: 60, 25: 120, 50: 250 };
  Object.entries(milestoneRewards).forEach(([thresholdText, thresholdReward]) => {
    const threshold = Number(thresholdText);
    if (previousCount < threshold && nextCount >= threshold) reward += thresholdReward;
  });
  return reward;
}

export function getBossEra(waveNumber: number): number {
  return Math.max(0, Math.floor(Math.max(1, waveNumber) / 5));
}

export function getEnemySkinTier(waveNumber: number): EnemySkinTier {
  const era = getBossEra(waveNumber);
  if (era >= 3) return 'apocalypse';
  if (era === 2) return 'ancient';
  if (era === 1) return 'scarred';
  return 'wild';
}

export function getEnemyKindForSpawn(waveNumber: number, spawnIndex: number): EnemyKind {
  if (waveNumber % 5 === 0 && spawnIndex === 0) return 'boss';
  if (waveNumber >= 6 && spawnIndex % 7 === 0) return 'healer';
  if (waveNumber >= 4 && spawnIndex % 5 === 0) return 'brute';
  if (waveNumber >= 3 && spawnIndex % 4 === 0) return 'runner';
  return 'normal';
}

export function getEnemyProfile(kind: EnemyKind, waveNumber: number): EnemyProfile {
  const bossEra = getBossEra(waveNumber);
  const skinTier = getEnemySkinTier(waveNumber);
  const eraHealthScale = 1 + bossEra * 0.28;
  const eraDamageScale = 1 + bossEra * 0.18;
  const eraTroopScale = 1 + bossEra * 0.22;
  const waveScale = 1 + Math.max(0, waveNumber - 1) * 0.18;
  const troopScale = 1 + Math.max(0, waveNumber - 1) * 0.14;
  const base = {
    kind,
    skinTier,
    bossEra,
    health: Math.round(28 * waveScale * eraHealthScale),
    speed: 34 + waveNumber * 3,
    damage: Math.max(5, Math.round(5 * waveScale * eraDamageScale)),
    troopDamage: Math.max(16, Math.round(16 * troopScale * eraTroopScale)),
    radius: 12,
    color: '#DC143C',
  };

  switch (kind) {
    case 'runner':
      return { ...base, health: Math.round(base.health * 0.62), speed: base.speed * 1.75, damage: Math.max(4, Math.round(base.damage * 0.75)), troopDamage: Math.max(12, Math.round(base.troopDamage * 0.75)), radius: 10, color: '#E7A93B' };
    case 'brute':
      return { ...base, health: Math.round(base.health * 2.35), speed: base.speed * 0.62, damage: Math.round(base.damage * 1.8), troopDamage: Math.round(base.troopDamage * 1.35), radius: 19, color: '#7A3F2B' };
    case 'healer':
      return { ...base, health: Math.round(base.health * 1.15), speed: base.speed * 0.82, damage: Math.max(3, Math.round(base.damage * 0.75)), troopDamage: Math.max(10, Math.round(base.troopDamage * 0.72)), radius: 14, color: '#5B8FD1', healingPower: Math.max(2, Math.round(base.health * 0.025)) };
    case 'boss':
      return { ...base, health: Math.round(base.health * (4.5 + bossEra * 0.8)), speed: base.speed * 1.22, damage: Math.round(base.damage * (2.2 + bossEra * 0.3)), troopDamage: Math.round(base.troopDamage * (1.65 + bossEra * 0.25)), radius: 19 + bossEra * 2, color: bossEra >= 3 ? '#4B1D6B' : bossEra === 2 ? '#341A52' : '#8B0000' };
    default:
      return { ...base, kind: 'normal' };
  }
}

export const INITIAL_GAME_CONFIG: GameConfig = {
  mapRadius: 150,
  plantationRadius: 30,
  pathCount: 8,
  spawnDistance: 220,
  combatCoinsPerSecond: 2,
  combatCoinsPerKill: 15,
  initialPlantationHealth: 100,
  waveInterval: 3,
};

export function getWavesUntilBoss(waveNumber: number): number {
  const remainder = waveNumber % 5;
  return remainder === 0 ? 0 : 5 - remainder;
}

export function getNextBossWave(waveNumber: number): number {
  return waveNumber + getWavesUntilBoss(waveNumber);
}

export function getWaveConfig(waveNumber: number): WaveConfig {
  const isBossWave = waveNumber % 5 === 0;
  const normalProfile = getEnemyProfile('normal', waveNumber);
  const bossProfile = getEnemyProfile('boss', waveNumber);
  const baseEnemyCount = 4 + Math.floor(waveNumber * 1.5);

  return {
    waveNumber,
    enemyCount: isBossWave ? 1 : baseEnemyCount,
    enemyHealth: isBossWave ? bossProfile.health : normalProfile.health,
    enemySpeed: isBossWave ? bossProfile.speed : normalProfile.speed,
    enemyDamage: isBossWave ? bossProfile.damage : normalProfile.damage,
    troopDamage: isBossWave ? bossProfile.troopDamage : normalProfile.troopDamage,
    isBossWave,
  };
}
