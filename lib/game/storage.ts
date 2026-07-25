import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BEST_WAVE: 'kardec_farmer_best_wave',
  TOTAL_GAMES: 'kardec_farmer_total_games',
  TOTAL_ENEMIES_DEFEATED: 'kardec_farmer_total_enemies_defeated',
  TOTAL_COINS_EARNED: 'kardec_farmer_total_coins_earned',
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
      (current + count).toString()
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
    console.error('Error getting total enemies defeated:', error);
    return 0;
  }
}

export async function addTotalCoinsEarned(coins: number): Promise<void> {
  try {
    const current = await getTotalCoinsEarned();
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOTAL_COINS_EARNED,
      (current + coins).toString()
    );
  } catch (error) {
    console.error('Error adding coins earned:', error);
  }
}

export async function getTotalCoinsEarned(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_COINS_EARNED);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting total coins earned:', error);
    return 0;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
