// Game types and interfaces

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
  cropType: 'warrior' | 'archer' | 'tank' | null;
  cropLevel: number;
  x: number;
  y: number;
  isWateredThisCycle: boolean;
}

export interface SprinklerState {
  angle: number; // angle in radians (0 to 2*PI)
  rotationSpeed: number; // radians per second
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
  pathIndex: number;
  pathProgress: number; // 0 to 1 down the main lane
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
  plotIndex: number; // Which quadrant spawned this guard
  type: 'warrior' | 'archer' | 'tank';
  health: number;
  maxHealth: number;
  damage: number;
  range: number;
  attackSpeed: number;
  attackCooldown: number;
  /** Velocidade visual de avanço em pixels por segundo até a distância de combate. */
  moveSpeed?: number;
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
  waveInterval: number;
}

export const GUARD_CONFIGS = {
  warrior: {
    cost: 100,
    health: 50,
    damage: 15,
    range: 90,
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
};

export const INITIAL_GAME_CONFIG: GameConfig = {
  mapRadius: 150,
  plantationRadius: 30,
  pathCount: 1, // Single lane path from top
  spawnDistance: 220,
  coinGainPerSecond: 2,
  coinGainPerKill: 15,
  initialPlantationHealth: 100,
  waveInterval: 3,
};

export function getWaveConfig(waveNumber: number): WaveConfig {
  const isBossWave = waveNumber % 5 === 0;
  const baseEnemyCount = 4 + Math.floor(waveNumber * 1.5);
  const baseHealth = 25 + waveNumber * 4;
  // Escala em pixels por segundo; o loop converte diretamente para o deslocamento do mapa.
  const baseSpeed = 32 + waveNumber * 2.2;
  const baseDamage = 5 + Math.floor(waveNumber / 2);

  return {
    waveNumber,
    enemyCount: isBossWave ? 1 : baseEnemyCount,
    enemyHealth: isBossWave ? baseHealth * 4 : baseHealth,
    enemySpeed: isBossWave ? baseSpeed * 1.3 : baseSpeed,
    enemyDamage: isBossWave ? baseDamage * 2 : baseDamage,
    isBossWave,
  };
}
