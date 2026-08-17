import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { useCardSystem } from '@/lib/game/useCardSystem';
import { getGuardStats, getGuardVisualProfile, GUARD_CONFIGS } from '@/lib/game/types';
import { GameIcon } from './GameIcon';

const GUARD_TYPES = ['warrior', 'archer', 'tank'] as const;
const GUARD_NAMES = {
  warrior: 'Guerreiro',
  archer: 'Arqueiro',
  tank: 'Tanque',
};

const GUARD_IMAGES = {
  warrior: {
    base: require('@/assets/images/guard-warrior.png'),
    veteran: require('@/assets/images/guard-warrior-veteran-transparent.png'),
    elite: require('@/assets/images/guard-warrior-elite-transparent.png'),
    legendary: require('@/assets/images/guard-warrior-legendary-transparent.png'),
  },
  archer: {
    base: require('@/assets/images/guard-archer.png'),
    veteran: require('@/assets/images/guard-archer-veteran-transparent.png'),
    elite: require('@/assets/images/guard-archer-veteran-transparent.png'),
    legendary: require('@/assets/images/guard-archer-legendary-transparent.png'),
  },
  tank: {
    base: require('@/assets/images/guard-tank.png'),
    veteran: require('@/assets/images/guard-tank-veteran-transparent.png'),
    elite: require('@/assets/images/guard-tank-elite-transparent.png'),
    legendary: require('@/assets/images/guard-tank-legendary-transparent.png'),
  },
};

const GUARD_ACCENTS = {
  warrior: '#4C8DDB',
  archer: '#78B84A',
  tank: '#A7B3C2',
};

export function CardBar() {
  const { state, dispatch } = useGame();
  const { selectCard, isCardAvailable, isTroopUnlocked, getCardCooldown, getCardMaxCooldown } = useCardSystem();
  const { width } = useWindowDimensions();
  const [cooldowns, setCooldowns] = useState<number[]>([0, 0, 0]);
  const cardWidth = Math.max(142, Math.min(188, (width - 34) / 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns([
        getCardCooldown(0),
        getCardCooldown(1),
        getCardCooldown(2),
      ]);
    }, 150);

    return () => clearInterval(interval);
  }, [getCardCooldown]);

  const handleCardPress = (cardIndex: number) => {
    const cropType = GUARD_TYPES[cardIndex];
    const config = GUARD_CONFIGS[cropType];
    if (state.coins < config.cost) return;

    if (state.selectedPlotIndex !== null) {
      dispatch({ type: 'SUBTRACT_COINS', amount: config.cost });
      dispatch({ type: 'PLANT_CROP', plotIndex: state.selectedPlotIndex, cropType });
    } else {
      selectCard(cardIndex);
    }
  };

  return (
    <View className="bg-[#102A1D] border-t border-[#315F40] py-2">
      <View className="px-3 pb-1 flex-row items-center justify-between">
        <Text className="text-[11px] font-bold tracking-wide text-[#DDEFC8]">TROPAS DA FAZENDA</Text>
        <Text className="text-[10px] text-[#9FBE9A]">Deslize para ver todas</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
      >
        {GUARD_TYPES.map((guardType, index) => {
          const config = GUARD_CONFIGS[guardType];
          const stats = getGuardStats(guardType, state.troopUpgradeLevels[guardType]);
          const visual = getGuardVisualProfile(guardType, state.troopUpgradeLevels[guardType]);
          const isSelected = state.selectedCardIndex === index;
          const canAfford = state.coins >= config.cost;
          const unlocked = isTroopUnlocked(index);
          const available = isCardAvailable(index);
          const cooldown = cooldowns[index];
          const maxCooldown = getCardMaxCooldown(index);
          const cooldownPercent = maxCooldown > 0 ? (1 - cooldown / maxCooldown) * 100 : 100;

          return (
            <Pressable
              key={guardType}
              onPress={() => handleCardPress(index)}
              disabled={!unlocked || !canAfford || !available}
              style={({ pressed }) => ({
                width: cardWidth,
                transform: [{ scale: pressed && canAfford && available ? 0.97 : 1 }],
                opacity: unlocked && canAfford && available ? 1 : 0.55,
              })}
            >
              <View
                className={`rounded-2xl p-3 border-2 relative overflow-hidden ${
                  isSelected ? 'border-[#F7C948] bg-[#315F40]' : 'border-[#3E6849] bg-[#1A3B29]'
                }`}
              >
                {!unlocked && (
                  <View className="absolute inset-0 z-10 items-center justify-center bg-[#0B1710]/75">
                    <Text className="rounded-lg border border-[#F7D774] bg-[#213E37] px-2 py-1 text-[10px] font-black tracking-wide text-[#FFF3C4]">BLOQUEADO</Text>
                    <Text className="mt-1 text-[9px] font-semibold text-[#DDEFC8]">Abra no acampamento</Text>
                  </View>
                )}

                {unlocked && !available && (
                  <View
                    className="absolute top-0 left-0 bottom-0 bg-black/45"
                    style={{ width: `${100 - cooldownPercent}%` }}
                  />
                )}

                <View className="flex-row items-center gap-2 mb-2">
                  <Image
                    source={GUARD_IMAGES[guardType][visual.tier]}
                    accessibilityLabel={`Ícone do ${GUARD_NAMES[guardType]}`}
                    resizeMode="contain"
                    style={{ width: 42, height: 42, borderColor: visual.armorColor, borderWidth: visual.tier === 'base' ? 0 : 1, borderRadius: 12 }}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm font-bold text-[#FFF3C4]">{GUARD_NAMES[guardType]}</Text>
                      <Text style={{ color: visual.accentColor }} className="text-[8px] font-black">{visual.title}</Text>
                      <Text className="rounded-full bg-[#DDECC8] px-1.5 py-0.5 text-[8px] font-black text-[#4C7742]">
                        {visual.badge} • LV {state.troopUpgradeLevels[guardType] + 1}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-[#B6D3B0]">
                      {isSelected ? 'Selecione um terreno' : 'Toque para invocar'}
                    </Text>
                  </View>
                </View>

                <View className="gap-1 mb-2">
                  <View className="flex-row items-center gap-1">
                    <GameIcon name="health" size={14} color="#8DCB63" secondaryColor={GUARD_ACCENTS[guardType]} />
                    <Text className="text-xs text-[#DDEFC8]">{stats.health}</Text>
                    <GameIcon name="damage" size={14} color="#F17C52" secondaryColor={GUARD_ACCENTS[guardType]} />
                    <Text className="text-xs text-[#DDEFC8]">{stats.damage}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <GameIcon name="range" size={14} color="#F7C948" secondaryColor={GUARD_ACCENTS[guardType]} />
                    <Text className="text-xs text-[#DDEFC8]">{stats.range}</Text>
                    <GameIcon name="speed" size={14} color="#65C7F4" secondaryColor={GUARD_ACCENTS[guardType]} />
                    <Text className="text-xs text-[#DDEFC8]">{config.attackSpeed}</Text>
                  </View>
                </View>

                <View className="bg-[#F7C948]/20 border border-[#C89A2C]/50 rounded-lg px-2 py-1 flex-row items-center gap-1">
                  <GameIcon name="coin" size={14} color="#F7C948" secondaryColor="#7D4E1F" />
                  <Text className="text-xs font-semibold text-[#F7C948]">{config.cost}</Text>
                </View>

                {!canAfford && <Text className="text-[10px] text-[#FF9B7A] mt-1 font-semibold">Sem moedas</Text>}
                {unlocked && !available && <Text className="text-[10px] text-[#F7C948] mt-1 font-semibold">{cooldown.toFixed(1)}s</Text>}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
