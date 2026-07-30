import React, { useMemo } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { useCardSystem } from '@/lib/game/useCardSystem';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  card: {
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  cardSelected: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardStats: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  cardCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: '#2D5016',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  insufficientFunds: {
    opacity: 0.6,
  },
});

const CARD_CONFIGS = [
  {
    name: 'Guerreiro',
    stats: '❤️ 50 | ⚔️ 15 | 🎯 80',
    cost: 100,
    color: '#4169E1',
  },
  {
    name: 'Arqueiro',
    stats: '❤️ 30 | ⚔️ 10 | 🎯 150',
    cost: 120,
    color: '#32CD32',
  },
  {
    name: 'Tanque',
    stats: '❤️ 100 | ⚔️ 5 | 🎯 60',
    cost: 150,
    color: '#A9A9A9',
  },
];

export function CardBarEnhanced() {
  const { state, dispatch } = useGame();
  const { cardCooldowns } = useCardSystem();

  const handleCardPress = (index: number) => {
    const cost = CARD_CONFIGS[index].cost;
    if (state.coins < cost) {
      return; // Can't afford
    }
    const cooldown = (cardCooldowns[index] as any)?.cooldown ?? 0;
    if (cooldown > 0) {
      return; // On cooldown
    }

    if (state.selectedCardIndex === index) {
      dispatch({ type: 'DESELECT_CARD' });
    } else {
      dispatch({ type: 'SELECT_CARD', cardIndex: index });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CARD_CONFIGS.map((card, index) => {
          const cost = card.cost;
          const canAfford = state.coins >= cost;
          const cooldown = (cardCooldowns[index] as any)?.cooldown ?? 0;
          const isSelected = state.selectedCardIndex === index;
          const isOnCooldown = cooldown > 0;

          return (
            <Pressable
              key={index}
              onPress={() => handleCardPress(index)}
              disabled={!canAfford || isOnCooldown}
              style={({ pressed }) => [
                styles.card,
                { borderColor: card.color },
                isSelected && styles.cardSelected,
                !canAfford && styles.insufficientFunds,
                pressed && !isOnCooldown && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardStats}>{card.stats}</Text>
              <Text style={styles.cardCost}>💰 {cost}</Text>

              {isOnCooldown && (
                <View style={styles.cooldownOverlay}>
                  <Text style={styles.cooldownText}>
                    {cooldown.toFixed(1)}s
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
