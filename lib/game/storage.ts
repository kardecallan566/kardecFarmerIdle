import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BestiaryProgress, GuardType, PersistentProgress } from './types';
import { DEFAULT_BESTIARY_PROGRESS, DEFAULT_BEACON_UPGRADE_LEVELS } from './types';

const STORAGE_KEYS = {
  BEST_WAVE: 'kardec_farmer_best_wave',
  TOTAL_GAMES: 'kardec_farmer_total_games',
  TOTAL_ENEMIES_DEFEATED: 'kardec_farmer_total_enemies_defeated',
  TOTAL_COMBAT_COINS_EARNED: 'kardec_farmer_total_combat_coins_earned',
  LEGACY_TOTAL_COINS_EARNED: 'kardec_farmer_total_coins_earned',
  PERSISTENT_PROGRESS: 'kardec_farmer_persistent_progress',
};

export const DEFAULT_PERSISTENT_PROGRESS: PersistentProgress = {
  bankGold: 0,
  unlockedTroops: ['warrior'],
  troopUpgradeLevels: { warrior: 0, archer: 0, tank: 0 },
  beaconUpgradeLevels: { ...DEFAULT_BEACON_UPGRADE_LEVELS },
  idleUpgradeLevel: 0,
  lastOnlineAt: Date.now(),
  bestiaryDefeated: { ...DEFAULT_BESTIARY_PROGRESS },
  bestWave: 0,
  totalGames: 0,
};

export async function saveBestWave(wave: number): Promise<void> {
  try {
    const currentBest = await getBestWave();
    if (wave > currentBest) {
      await AsyncStorage.setItem(STORAGE_KEYS.BEST_WAVE, wave.toString());
    }
  } catch (error) {
    console.error('Error saving best wave:', error);
  }
}

export async function getBestWave(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.BEST_WAVE);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting best wave:', error);
    return 0;
  }
}

export async function incrementTotalGames(): Promise<void> {
  try {
    const current = await getTotalGames();
    await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_GAMES, (current + 1).toString());
  } catch (error) {
    console.error('Error incrementing total games:', error);
  }
}

export async function getTotalGames(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_GAMES);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting total games:', error);
    return 0;
  }
}

export async function addTotalEnemiesDefeated(count: number): Promise<void> {
  try {
    const current = await getTotalEnemiesDefeated();
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOTAL_ENEMIES_DEFEATED,
      (current + count).toString(),
    );
  } catch (error) {
    console.error('Error adding enemies defeated:', error);
  }
}

export async function getTotalEnemiesDefeated(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_ENEMIES_DEFEATED);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting enemies defeated:', error);
    return 0;
  }
}

export async function addTotalCombatCoinsEarned(combatCoins: number): Promise<void> {
  try {
    const current = await getTotalCombatCoinsEarned();
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOTAL_COMBAT_COINS_EARNED,
      (current + combatCoins).toString(),
    );
  } catch (error) {
    console.error('Error adding combat coins earned:', error);
  }
}

export async function getTotalCombatCoinsEarned(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_COMBAT_COINS_EARNED)
      ?? await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_TOTAL_COINS_EARNED);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting combat coins earned:', error);
    return 0;
  }
}

function normalizeBestiary(raw: Partial<BestiaryProgress> | null | undefined): BestiaryProgress {
  return {
    normal: Math.max(0, Number(raw?.normal) || 0),
    runner: Math.max(0, Number(raw?.runner) || 0),
    brute: Math.max(0, Number(raw?.brute) || 0),
    healer: Math.max(0, Number(raw?.healer) || 0),
    boss: Math.max(0, Number(raw?.boss) || 0),
  };
}

function normalizeProgress(raw: Partial<PersistentProgress> | null): PersistentProgress {
  const unlockedTroops = Array.isArray(raw?.unlockedTroops)
    ? raw.unlockedTroops.filter((type): type is GuardType =>
        type === 'warrior' || type === 'archer' || type === 'tank',
      )
    : [];

  return {
    bankGold: Math.max(0, Number(raw?.bankGold) || 0),
    unlockedTroops: Array.from(new Set(['warrior', ...unlockedTroops])),
    troopUpgradeLevels: {
      warrior: Math.max(0, Number(raw?.troopUpgradeLevels?.warrior) || 0),
      archer: Math.max(0, Number(raw?.troopUpgradeLevels?.archer) || 0),
      tank: Math.max(0, Number(raw?.troopUpgradeLevels?.tank) || 0),
    },
    beaconUpgradeLevels: {
      lightSpeed: Math.min(5, Math.max(0, Number(raw?.beaconUpgradeLevels?.lightSpeed) || 0)),
      multiSpawn: Math.min(2, Math.max(0, Number(raw?.beaconUpgradeLevels?.multiSpawn) || 0)),
      extraSlots: Math.min(4, Math.max(0, Number(raw?.beaconUpgradeLevels?.extraSlots) || 0)),
    },
    idleUpgradeLevel: Math.min(5, Math.max(0, Number(raw?.idleUpgradeLevel) || 0)),
    lastOnlineAt: Number(raw?.lastOnlineAt) > 0 ? Number(raw?.lastOnlineAt) : Date.now(),
    bestiaryDefeated: normalizeBestiary(raw?.bestiaryDefeated),
    bestWave: Math.max(0, Number(raw?.bestWave) || 0),
    totalGames: Math.max(0, Number(raw?.totalGames) || 0),
  };
}

export async function getPersistentProgress(): Promise<PersistentProgress> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PERSISTENT_PROGRESS);
    return value
      ? normalizeProgress(JSON.parse(value) as Partial<PersistentProgress>)
      : DEFAULT_PERSISTENT_PROGRESS;
  } catch (error) {
    console.error('Error getting persistent progress:', error);
    return DEFAULT_PERSISTENT_PROGRESS;
  }
}

export async function savePersistentProgress(progress: PersistentProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PERSISTENT_PROGRESS,
      JSON.stringify(normalizeProgress(progress)),
    );
  } catch (error) {
    console.error('Error saving persistent progress:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
