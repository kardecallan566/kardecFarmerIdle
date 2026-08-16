// Game types and interfaces

export type GuardType = 'warrior' | 'archer' | 'tank';
export type BeaconUpgradeType = 'lightSpeed' | 'multiSpawn' | 'extraSlots';

export interface BeaconUpgradeLevels {
  lightSpeed: number;
  multiSpawn: number;
  extraSlots: number;
}

export const DEFAULT_BEACON_UPGRADE_LEVELS: BeaconUpgradeLevels = {
  lightSpeed: 0,
  multiSpawn: 0,
  extraSlots: 0,
};

export interface PersistentProgress {
  bankGold: number;
  unlockedTroops: GuardType[];
  troopUpgradeLevels: Record<GuardType, number>;
  beaconUpgradeLevels: BeaconUpgradeLevels;
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
  coins: number;
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
  totalCoinsEarned: number;
  upgrades: Upgrade[];
  selectedCardIndex: number | null;
  placingMode: boolean;
  bankGold: number;
  unlockedTroops: GuardType[];
  troopUpgradeLevels: Record<GuardType, number>;
  beaconUpgradeLevels: BeaconUpgradeLevels;
  bestWave: number;
  totalGames: number;
  progressLoaded: boolean;
  runRewardClaimed: boolean;
  lastRunReward: number;
}

export interface Enemy {
  id: string;
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
  /** Velocidade de avanço até a linha segura de combate. */
  moveSpeed?: number;
  color: string;
  targetId?: string;
}

export interface Card {
  id: string;
  type: GuardType;
  cost: number;
  cooldown: number;
  maxCooldown: number;
  available: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: 'damage' | 'range' | 'cost' | 'coins' | 'health' | 'guardSpecific';
  value: number;
  targetGuard?: GuardType;
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

export interface GameConfig {
  mapRadius: number;
  plantationRadius: number;
  pathCount: number;
  spawnDistance: number;
  coinGainPerSecond: number;
  coinGainPerKill: number;
  initialPlantationHealth: number;
  waveInterval: number;
}

export const GUARD_CONFIGS = {
  warrior: {
    cost: 100,
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
    cost: 120,
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
    cost: 150,
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
  cost: number;
  health: number;
  damage: number;
  range: number;
  attackSpeed: number;
  moveSpeed: number;
  color: string;
  name: string;
  cropName: string;
}>;

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

export const INITIAL_GAME_CONFIG: GameConfig = {
  mapRadius: 150,
  plantationRadius: 30,
  pathCount: 1,
  spawnDistance: 220,
  coinGainPerSecond: 2,
  coinGainPerKill: 15,
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
  const waveScale = 1 + Math.max(0, waveNumber - 1) * 0.18;
  const baseEnemyCount = 4 + Math.floor(waveNumber * 1.5);
  const baseHealth = Math.round(28 * waveScale);
  const baseSpeed = 34 + waveNumber * 3;
  const baseDamage = Math.max(5, Math.round(5 * waveScale));
  const baseTroopDamage = Math.max(16, Math.round(16 * (1 + Math.max(0, waveNumber - 1) * 0.14)));

  return {
    waveNumber,
    enemyCount: isBossWave ? 1 : baseEnemyCount,
    enemyHealth: isBossWave ? Math.round(baseHealth * 4.5) : baseHealth,
    enemySpeed: isBossWave ? baseSpeed * 1.22 : baseSpeed,
    enemyDamage: isBossWave ? Math.round(baseDamage * 2.2) : baseDamage,
    troopDamage: isBossWave ? Math.round(baseTroopDamage * 1.65) : baseTroopDamage,
    isBossWave,
  };
}
