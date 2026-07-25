import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { useCardSystem } from '@/lib/game/useCardSystem';
import { GUARD_CONFIGS } from '@/lib/game/types';

const { width: screenWidth } = Dimensions.get('window');

const GUARD_TYPES = ['warrior', 'archer', 'tank'] as const;
const GUARD_NAMES = {
  warrior: 'Guerreiro',
  archer: 'Arqueiro',
  tank: 'Tanque',
};

export function CardBar() {
  const { state } = useGame();
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
    }, 100);

    return () => clearInterval(interval);
  }, [getCardCooldown]);

  const handleCardPress = (cardIndex: number) => {
    selectCard(cardIndex);
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

              {/* Card Title */}
              <Text className="text-sm font-bold text-foreground mb-1">
                {GUARD_NAMES[guardType]}
              </Text>

              {/* Card Stats */}
              <View className="gap-0.5 mb-2">
                <Text className="text-xs text-muted">
                  💚 {config.health} | 🗡️ {config.damage}
                </Text>
                <Text className="text-xs text-muted">
                  📏 {config.range} | ⚡ {config.attackSpeed}
                </Text>
              </View>

              {/* Cost */}
              <View className="bg-warning/20 rounded px-2 py-1">
                <Text className="text-xs font-semibold text-warning">
                  💰 {config.cost}
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
