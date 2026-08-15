import React from 'react';
import { View, Text } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { GameIcon } from './GameIcon';

export function GameHUD() {
  const { state } = useGame();

  const healthPercent = Math.max(0, Math.min(100, (state.plantationHealth / state.maxPlantationHealth) * 100));

  return (
    <View className="bg-[#163B2B] border-b border-[#315F40] px-3 py-3 flex-row justify-between items-center">
      {/* Left: Wave and Enemies */}
      <View className="gap-1">
        <View className="flex-row items-center gap-1.5">
          <GameIcon name="wave" size={18} color="#F7C948" secondaryColor="#8DCB63" />
          <Text className="text-sm font-bold text-[#FFF3C4]">
            Wave {state.wave}
          </Text>
        </View>
        <Text className="text-xs text-[#B6D3B0]">
          Inimigos: {state.waveEnemiesRemaining}/{state.waveEnemiesTotal}
        </Text>
      </View>

      {/* Center: Plantation Health */}
      <View className="gap-1 items-center">
        <View className="flex-row items-center gap-1.5">
          <GameIcon name="health" size={18} color="#65C7F4" secondaryColor="#8DCB63" />
          <Text className="text-xs text-[#E2F1D5] font-bold">Plantação</Text>
        </View>
        <View className="w-24 h-2 bg-[#0B2419] rounded-full overflow-hidden border border-[#44704C]">
          <View
            className="h-full bg-[#8DCB63]"
            style={{ width: `${healthPercent}%` }}
          />
        </View>
        <Text className="text-xs text-[#FFF3C4] font-bold">
          {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}
        </Text>
      </View>

      {/* Right: Coins */}
      <View className="gap-1 items-end">
        <View className="flex-row items-center gap-1.5">
          <GameIcon name="coin" size={18} color="#F7C948" secondaryColor="#7D4E1F" />
          <Text className="text-sm font-bold text-[#FFF3C4]">
            {Math.floor(state.coins)}
          </Text>
        </View>
        <Text className="text-xs text-[#B6D3B0]">Moedas</Text>
      </View>
    </View>
  );
}
