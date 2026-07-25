import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { generateUpgradeOptions } from '@/lib/game/utils';

export function WaveRewardsScreen() {
  const { state, dispatch } = useGame();
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show rewards screen after wave completion
    if (state.waveEnemiesRemaining === 0 && state.enemies.length === 0 && state.wave > 1) {
      const newUpgrades = generateUpgradeOptions(3);
      setUpgrades(newUpgrades);
      setVisible(true);
    }
  }, [state.waveEnemiesRemaining, state.enemies.length, state.wave]);

  const handleSelectUpgrade = (upgradeIndex: number) => {
    dispatch({ type: 'APPLY_UPGRADE', upgradeIndex });
    setVisible(false);
    // Continue to next wave
    setTimeout(() => {
      dispatch({ type: 'NEXT_WAVE' });
    }, 500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="bg-surface rounded-lg p-6 gap-4">
            <Text className="text-2xl font-bold text-foreground text-center">
              Escolha uma Melhoria
            </Text>

            <View className="gap-3">
              {upgrades.map((upgrade, index) => (
                <Pressable
                  key={upgrade.id}
                  onPress={() => handleSelectUpgrade(index)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View className="bg-background rounded-lg p-4 border-2 border-primary">
                    <Text className="text-lg font-bold text-foreground mb-1">
                      {upgrade.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {upgrade.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
