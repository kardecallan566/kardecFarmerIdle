// Game types and interfaces

export interface Vector2 {
  x: number;
  y: number;
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
  waveEnemiesRemaining: number;
  waveEnemiesTotal: number;
  totalEnemiesDefeated: number;
  totalCoinsEarned: number;
  upgrades: Upgrade[];
  selectedCardIndex: number | null;
  placingMode: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  pathIndex: number; // Which radial path this enemy is on
  pathProgress: number; // 0 to 1, how far along the path
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  radius: number;
  color: string;
  isBoss: boolean;
  bossAbilities?: BossAbility[];
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
  type: 'warrior' | 'archer' | 'tank';
  health: number;
  maxHealth: number;
  damage: number;
  range: number;
  attackSpeed: number;
  attackCooldown: number;
  color: string;
  targetId?: string;
}

export interface Card {
  id: string;
  type: 'warrior' | 'archer' | 'tank';
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
  targetGuard?: 'warrior' | 'archer' | 'tank';
}

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  enemyHealth: number;
  enemySpeed: number;
  enemyDamage: number;
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
  waveInterval: number; // seconds between waves
}

export const GUARD_CONFIGS = {
  warrior: {
    cost: 100,
    health: 50,
    damage: 15,
    range: 80,
    attackSpeed: 1.0,
    color: '#4169E1',
  },
  archer: {
    cost: 120,
    health: 30,
    damage: 10,
    range: 150,
    attackSpeed: 1.5,
    color: '#32CD32',
  },
  tank: {
    cost: 150,
    health: 100,
    damage: 5,
    range: 60,
    attackSpeed: 0.5,
    color: '#A9A9A9',
  },
};

export const INITIAL_GAME_CONFIG: GameConfig = {
  mapRadius: 150,
  plantationRadius: 20,
  pathCount: 4,
  spawnDistance: 200,
  coinGainPerSecond: 1,
  coinGainPerKill: 10,
  initialPlantationHealth: 100,
  waveInterval: 3,
};

export function getWaveConfig(waveNumber: number): WaveConfig {
  const isBossWave = waveNumber % 5 === 0;
  const baseEnemyCount = 5 + Math.floor(waveNumber / 2);
  const baseHealth = 20 + waveNumber * 2;
  const baseSpeed = 0.5 + waveNumber * 0.05;
  const baseDamage = 5 + Math.floor(waveNumber / 3);

  return {
    waveNumber,
    enemyCount: isBossWave ? 1 : baseEnemyCount,
    enemyHealth: isBossWave ? baseHealth * 5 : baseHealth,
    enemySpeed: isBossWave ? baseSpeed * 1.5 : baseSpeed,
    enemyDamage: isBossWave ? baseDamage * 2 : baseDamage,
    isBossWave,
  };
}
