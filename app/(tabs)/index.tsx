import React, { useState } from 'react';
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

  const handleRestartGame = () => {
    setShowRewards(false);
    dispatch({ type: 'INIT_GAME' });
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <HomeScreen onStartGame={handleStartGame} />;
  }

  if (state.gameLost || state.plantationHealth <= 0) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center p-6 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-4xl font-bold text-foreground">Game Over!</Text>
            <Text className="max-w-sm text-center text-base text-muted">
              Um inimigo alcançou o regador e a plantação ficou sem vida.
            </Text>
            <View className="w-full max-w-sm rounded-2xl border border-[#E27D6A] bg-[#FFF0EC] px-4 py-3">
              <Text className="text-center text-sm font-black text-[#9E3F2B]">REGADOR SEM VIDA</Text>
              <Text className="mt-1 text-center text-xs text-[#9E3F2B]">
                Plantação: {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}. Os avisos de dano aparecem na HUD durante a partida.
              </Text>
            </View>
            <View className="bg-surface rounded-2xl p-6 w-full max-w-sm gap-4">
              <View className="gap-2">
                <Text className="text-lg font-semibold text-foreground">Estatísticas Finais</Text>
                <Text className="text-base text-muted">Wave alcançada: {state.wave}</Text>
                <Text className="text-base text-muted">Inimigos derrotados: {state.totalEnemiesDefeated}</Text>
                <Text className="text-base text-muted">Guardas colocados: {state.guards.length}</Text>
                <Text className="text-base text-muted">Moedas acumuladas: {state.coins}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleRestartGame}
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
    <ScreenContainer
      edges={['top', 'left', 'right']}
      className="bg-background"
      safeAreaClassName="bg-background"
    >
      <GameHUD />
      <GameMap />
      <CardBar />
    </ScreenContainer>
  );
}
