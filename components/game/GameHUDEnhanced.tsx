import React, { useMemo } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { useColors } from '@/hooks/use-colors';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  waveInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D5016',
    backgroundColor: '#FFE066',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  healthBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    minWidth: 100,
  },
  healthFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  healthFillDamaged: {
    backgroundColor: '#FF6B6B',
  },
  coinCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    minWidth: 90,
  },
  coinText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
  },
  enemyCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export function GameHUDEnhanced() {
  const { state } = useGame();
  const colors = useColors();

  const healthPercentage = useMemo(() => {
    return Math.max(0, (state.plantationHealth / state.maxPlantationHealth) * 100);
  }, [state.plantationHealth, state.maxPlantationHealth]);

  const isHealthLow = healthPercentage < 30;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Wave Info */}
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>Wave</Text>
          <Text style={styles.statValue}>{state.wave}</Text>
        </View>

        {/* Enemies Count */}
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>Inimigos</Text>
          <Text style={styles.statValue}>{state.enemies.length}</Text>
        </View>

        {/* Plantation Health */}
        <View style={{ flex: 1, minWidth: 120 }}>
          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>Plantação</Text>
            <Text style={styles.statValue}>
              {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}
            </Text>
          </View>
          <View style={styles.healthBar}>
            <View
              style={[
                styles.healthFill,
                isHealthLow && styles.healthFillDamaged,
                { width: `${healthPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Coins Counter */}
        <View style={styles.coinCounter}>
          <Text style={styles.coinText}>💰</Text>
          <Text style={styles.coinText}>{state.coins}</Text>
        </View>
      </View>
    </View>
  );
}
