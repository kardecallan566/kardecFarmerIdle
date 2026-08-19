import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { getRelicBehaviorLabel, getRelicRarityConfig } from '@/lib/game/relics';

const UPGRADE_COLORS: Record<string, string> = {
  damage: '#D85C43',
  range: '#4A91C7',
  cost: '#B8842C',
  combatCoins: '#D49B2C',
  health: '#5C9C63',
  guardSpecific: '#7A61B8',
};

export function WaveRewardsScreen() {
  const { state, dispatch } = useGame();
  const visible = state.pendingWaveRewards.length > 0 || state.activeRunEvent !== null;

  const handleSelectUpgrade = (upgradeIndex: number) => {
    dispatch({ type: 'APPLY_UPGRADE', upgradeIndex });
  };

  const handleChooseEvent = (choiceId: string) => {
    dispatch({ type: 'CHOOSE_RUN_EVENT', choiceId });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-[#08130D]/75 p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }}>
          <View className="mx-auto w-full max-w-[390px] rounded-3xl border-2 border-[#E5C76B] bg-[#F8F3DE] p-5 shadow-2xl">
            {state.activeRunEvent ? (
              <View>
                <View className="items-center">
                  <Text className="text-[10px] font-black tracking-[2px] text-[#8A7040]">EVENTO DE RUN</Text>
                  <Text className="mt-1 text-2xl font-black text-[#294F2E]">{state.activeRunEvent.title}</Text>
                  <Text className="mt-2 text-center text-xs leading-4 text-[#71835E]">{state.activeRunEvent.description}</Text>
                </View>

                <View className="mt-5 gap-3">
                  {state.activeRunEvent.choices.map((choice) => (
                    <Pressable
                      key={choice.id}
                      onPress={() => handleChooseEvent(choice.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Escolher ${choice.title}`}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        opacity: pressed ? 0.88 : 1,
                      })}
                    >
                      <View className="rounded-2xl border border-[#C9D9BC] bg-white/80 p-4">
                        <Text className="text-base font-black text-[#294F2E]">{choice.title}</Text>
                        <Text className="mt-1 text-xs leading-4 text-[#71835E]">{choice.description}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View>
                <View className="items-center">
                  <Text className="text-[10px] font-black tracking-[2px] text-[#8A7040]">INTERVALO TÁTICO</Text>
                  <Text className="mt-1 text-2xl font-black text-[#294F2E]">A defesa aprendeu</Text>
                  <Text className="mt-1 text-center text-xs leading-4 text-[#71835E]">Escolha uma relíquia para moldar a próxima wave. A arena está pausada.</Text>
                </View>

                <View className="mt-4 gap-3">
                  {state.pendingWaveRewards.map((upgrade, index) => {
                    const rarityConfig = getRelicRarityConfig(upgrade.rarity ?? 'common');
                    const accent = upgrade.rarity ? rarityConfig.color : UPGRADE_COLORS[upgrade.type] ?? '#4E8B46';
                    return (
                      <Pressable
                        key={upgrade.id}
                        onPress={() => handleSelectUpgrade(index)}
                        accessibilityRole="button"
                        accessibilityLabel={`Escolher melhoria ${upgrade.name}`}
                        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.88 : 1 })}
                      >
                        <View className="rounded-2xl border border-[#D6DCC4] bg-white/80 p-4" style={{ borderLeftWidth: 6, borderLeftColor: accent }}>
                          <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                              <Text className="text-base font-black text-[#294F2E]">{upgrade.name}</Text>
                              <View className="mt-1 flex-row items-center gap-1.5">
                                <Text className="text-[9px] font-black" style={{ color: accent }}>{rarityConfig.label}</Text>
                                {upgrade.behavior && (
                                  <Text className="text-[9px] font-black text-[#71835E]">{getRelicBehaviorLabel(upgrade.behavior)}</Text>
                                )}
                              </View>
                            </View>
                            <Text className="rounded-full px-2 py-1 text-[9px] font-black text-white" style={{ backgroundColor: accent }}>ESCOLHER</Text>
                          </View>
                          <Text className="mt-2 text-xs leading-4 text-[#71835E]">{upgrade.description}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
