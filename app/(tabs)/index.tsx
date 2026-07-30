import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { GameMap } from '@/components/game/GameMap';
import { GameHUD } from '@/components/game/GameHUD';
import { CardBar } from '@/components/game/CardBar';
import { WaveRewardsScreen } from '@/components/game/WaveRewardsScreen';
import { HomeScreen } from '@/components/game/HomeScreen';
import { useGame } from '@/lib/game/GameContext';
import { useGameLoop } from '@/lib/game/useGameLoop';
import { useUpgrades } from '@/lib/game/useUpgrades';
import { useBossWaves } from '@/lib/game/useBossWaves';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  useGameLoop();
  useUpgrades();
  useBossWaves();

  const handleStartGame = () => {
    setGameStarted(true);
    dispatch({ type: 'INIT_GAME' });
  };

  const handleGameOver = () => {
    setGameStarted(false);
    setShowRewards(false);
    dispatch({ type: 'INIT_GAME' });
  };

  const handleSelectUpgrade = (upgradeIndex: number) => {
    dispatch({ type: 'APPLY_UPGRADE', upgradeIndex });
    setShowRewards(false);
  };

  if (!gameStarted) {
    return <HomeScreen />;
  }

  if (state.plantationHealth <= 0) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center p-6 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-4xl font-bold text-foreground">Game Over!</Text>
            <View className="bg-surface rounded-2xl p-6 w-full max-w-sm gap-4">
              <View className="gap-2">
                <Text className="text-lg font-semibold text-foreground">Estatísticas Finais</Text>
                <Text className="text-base text-muted">Wave Alcançada: {state.wave}</Text>
                <Text className="text-base text-muted">Guardas Colocados: {state.guards.length}</Text>
                <Text className="text-base text-muted">Total de Moedas: {state.coins}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleGameOver}
              className="bg-primary px-8 py-4 rounded-full active:opacity-80"
            >
              <Text className="text-background font-bold text-lg">Jogar Novamente</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (showRewards && state.upgrades.length > 0) {
    return (
      <WaveRewardsScreen />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <GameHUD />
      <GameMap />
      <CardBar />
    </View>
  );
}
