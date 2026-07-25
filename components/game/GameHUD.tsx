import React from 'react';
import { View, Text } from 'react-native';
import { useGame } from '@/lib/game/GameContext';

export function GameHUD() {
  const { state } = useGame();

  return (
    <View className="bg-surface border-b border-border px-4 py-3 flex-row justify-between items-center">
      {/* Left: Wave and Enemies */}
      <View className="gap-1">
        <Text className="text-sm font-semibold text-foreground">
          Wave {state.wave}
        </Text>
        <Text className="text-xs text-muted">
          Inimigos: {state.waveEnemiesRemaining}/{state.waveEnemiesTotal}
        </Text>
      </View>

      {/* Center: Plantation Health */}
      <View className="gap-1 items-center">
        <Text className="text-xs text-muted">Plantação</Text>
        <View className="w-24 h-2 bg-border rounded-full overflow-hidden">
          <View
            className="h-full bg-success"
            style={{
              width: `${(state.plantationHealth / state.maxPlantationHealth) * 100}%`,
            }}
          />
        </View>
        <Text className="text-xs text-foreground font-semibold">
          {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}
        </Text>
      </View>

      {/* Right: Coins */}
      <View className="gap-1 items-end">
        <Text className="text-sm font-semibold text-foreground">
          💰 {Math.floor(state.coins)}
        </Text>
        <Text className="text-xs text-muted">Moedas</Text>
      </View>
    </View>
  );
}
