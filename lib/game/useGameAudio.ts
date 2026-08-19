import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useGame } from './GameContext';

const FOREST_DEFENSE_MUSIC = require('@/assets/audio/forest-defense-loop.wav');

type HapticEvent = 'hit' | 'wave' | 'danger' | 'gameOver' | 'reward';

export function triggerGameHaptic(event: HapticEvent): void {
  if (Platform.OS === 'web') return;
  const task = event === 'gameOver'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    : event === 'reward'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : event === 'danger'
        ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        : event === 'wave'
          ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  void task.catch(() => undefined);
}

export function useGameAudio(enabled = true): void {
  const player = useAudioPlayer(FOREST_DEFENSE_MUSIC, { updateInterval: 1000 });

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  useEffect(() => {
    player.loop = true;
    player.volume = 0.22;
    if (enabled) {
      player.play();
    } else {
      player.pause();
    }

    return () => {
      player.pause();
    };
  }, [enabled, player]);
}

export function useGameFeedback(): void {
  const { state } = useGame();
  const previousHealth = useRef(state.plantationHealth);
  const previousWave = useRef(state.wave);
  const previousDefeated = useRef(state.totalEnemiesDefeated);
  const previousGameLost = useRef(state.gameLost);

  useEffect(() => {
    if (state.plantationHealth < previousHealth.current) {
      triggerGameHaptic(state.plantationHealth <= state.maxPlantationHealth * 0.25 ? 'danger' : 'hit');
    }
    previousHealth.current = state.plantationHealth;
  }, [state.maxPlantationHealth, state.plantationHealth]);

  useEffect(() => {
    if (state.wave > previousWave.current) triggerGameHaptic('wave');
    previousWave.current = state.wave;
  }, [state.wave]);

  useEffect(() => {
    if (state.totalEnemiesDefeated > previousDefeated.current) triggerGameHaptic('hit');
    previousDefeated.current = state.totalEnemiesDefeated;
  }, [state.totalEnemiesDefeated]);

  useEffect(() => {
    if (state.gameLost && !previousGameLost.current) triggerGameHaptic('gameOver');
    previousGameLost.current = state.gameLost;
  }, [state.gameLost]);
}
