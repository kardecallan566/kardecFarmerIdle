import React from 'react';
import { Text, View } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { GameIcon } from './GameIcon';

export function GameHUD() {
  const { state } = useGame();
  const healthPercent = Math.max(
    0,
    Math.min(100, (state.plantationHealth / state.maxPlantationHealth) * 100),
  );

  return (
    <View className="bg-[#163B2B] border-b border-[#315F40] px-3 py-2.5">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-1.5">
            <GameIcon name="wave" size={17} color="#F7C948" secondaryColor="#8DCB63" />
            <Text numberOfLines={1} className="text-xs font-bold text-[#FFF3C4]">
              Wave {state.wave}
            </Text>
          </View>
          <Text numberOfLines={1} className="text-[10px] text-[#B6D3B0]">
            {state.waveEnemiesRemaining}/{state.waveEnemiesTotal} inimigos
          </Text>
        </View>

        <View className="flex-[1.2] min-w-0 items-center">
          <View className="flex-row items-center gap-1.5">
            <GameIcon name="health" size={17} color="#65C7F4" secondaryColor="#8DCB63" />
            <Text numberOfLines={1} className="text-[10px] text-[#E2F1D5] font-bold">
              Plantação
            </Text>
          </View>
          <View className="w-full max-w-[126px] h-2 bg-[#0B2419] rounded-full overflow-hidden border border-[#44704C]">
            <View className="h-full bg-[#8DCB63]" style={{ width: `${healthPercent}%` }} />
          </View>
          <Text className="text-[10px] text-[#FFF3C4] font-bold">
            {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}
          </Text>
        </View>

        <View className="flex-1 min-w-0 items-end">
          <View className="flex-row items-center gap-1.5">
            <GameIcon name="coin" size={17} color="#F7C948" secondaryColor="#7D4E1F" />
            <Text numberOfLines={1} className="text-xs font-bold text-[#FFF3C4]">
              {Math.floor(state.coins)}
            </Text>
          </View>
          <Text className="text-[10px] text-[#B6D3B0]">Moedas</Text>
        </View>
      </View>
    </View>
  );
}
