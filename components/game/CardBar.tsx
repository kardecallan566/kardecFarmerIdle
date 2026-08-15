import React, { useEffect, useState } from 'react';
import { Image, View, Text, Pressable, Dimensions } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { useCardSystem } from '@/lib/game/useCardSystem';
import { GUARD_CONFIGS } from '@/lib/game/types';
import { GameIcon } from './GameIcon';

const { width: screenWidth } = Dimensions.get('window');

const GUARD_TYPES = ['warrior', 'archer', 'tank'] as const;
const GUARD_NAMES = {
  warrior: 'Guerreiro',
  archer: 'Arqueiro',
  tank: 'Tanque',
};

const GUARD_IMAGES = {
  warrior: require('@/assets/images/guard-warrior.png'),
  archer: require('@/assets/images/guard-archer.png'),
  tank: require('@/assets/images/guard-tank.png'),
};

const GUARD_ACCENTS = {
  warrior: '#4C8DDB',
  archer: '#78B84A',
  tank: '#A7B3C2',
};

export function CardBar() {
  const { state, dispatch } = useGame();
  const { selectCard, isCardAvailable, getCardCooldown, getCardMaxCooldown } = useCardSystem();
  const [cooldowns, setCooldowns] = useState<number[]>([0, 0, 0]);

  // Update cooldown display
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
    const cropTypes = ['warrior', 'archer', 'tank'] as const;
    const cropType = cropTypes[cardIndex];
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
    <View className="bg-surface border-t border-border px-2 py-3 flex-row justify-around items-center gap-2">
      {GUARD_TYPES.map((guardType, index) => {
        const config = GUARD_CONFIGS[guardType];
        const isSelected = state.selectedCardIndex === index;
        const canAfford = state.coins >= config.cost;
        const available = isCardAvailable(index);
        const cooldown = cooldowns[index];
        const maxCooldown = getCardMaxCooldown(index);
        const cooldownPercent = maxCooldown > 0 ? (1 - cooldown / maxCooldown) * 100 : 100;

        return (
          <Pressable
            key={guardType}
            onPress={() => handleCardPress(index)}
            disabled={!canAfford || !available}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed && canAfford && available ? 0.95 : 1 }],
                opacity: canAfford && available ? 1 : 0.5,
              },
            ]}
          >
            <View
              className={`rounded-lg p-3 border-2 relative overflow-hidden ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              }`}
              style={{ width: screenWidth / 3.5 }}
            >
              {/* Cooldown overlay */}
              {!available && (
                <View
                  className="absolute top-0 left-0 bottom-0 bg-black/30"
                  style={{ width: `${100 - cooldownPercent}%` }}
                />
              )}

              {/* Card Header */}
              <View className="flex-row items-center gap-2 mb-2">
                <Image
                  source={GUARD_IMAGES[guardType]}
                  accessibilityLabel={`Ícone do ${GUARD_NAMES[guardType]}`}
                  resizeMode="contain"
                  style={{ width: 42, height: 42 }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    {GUARD_NAMES[guardType]}
                  </Text>
                  <Text className="text-[10px] text-muted">
                    {isSelected ? 'Selecione um terreno' : 'Toque para invocar'}
                  </Text>
                </View>
              </View>

              {/* Card Stats */}
              <View className="gap-1 mb-2">
                <View className="flex-row items-center gap-1">
                  <GameIcon name="health" size={14} color="#8DCB63" secondaryColor={GUARD_ACCENTS[guardType]} />
                  <Text className="text-xs text-muted">{config.health}</Text>
                  <GameIcon name="damage" size={14} color="#F17C52" secondaryColor={GUARD_ACCENTS[guardType]} />
                  <Text className="text-xs text-muted">{config.damage}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <GameIcon name="range" size={14} color="#F7C948" secondaryColor={GUARD_ACCENTS[guardType]} />
                  <Text className="text-xs text-muted">{config.range}</Text>
                  <GameIcon name="speed" size={14} color="#65C7F4" secondaryColor={GUARD_ACCENTS[guardType]} />
                  <Text className="text-xs text-muted">{config.attackSpeed}</Text>
                </View>
              </View>

              {/* Cost */}
              <View className="bg-[#F7C948]/20 border border-[#C89A2C]/50 rounded px-2 py-1 flex-row items-center gap-1">
                <GameIcon name="coin" size={14} color="#F7C948" secondaryColor="#7D4E1F" />
                <Text className="text-xs font-semibold text-warning">
                  {config.cost}
                </Text>
              </View>

              {/* Availability indicator */}
              {!canAfford && (
                <Text className="text-xs text-error mt-1 font-semibold">
                  Sem moedas
                </Text>
              )}

              {!available && (
                <Text className="text-xs text-warning mt-1 font-semibold">
                  {cooldown.toFixed(1)}s
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
