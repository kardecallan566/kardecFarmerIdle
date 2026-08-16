import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { GameMap } from '@/components/game/GameMap';
import { GameHUD } from '@/components/game/GameHUD';
import { CardBar } from '@/components/game/CardBar';
import { WaveRewardsScreen } from '@/components/game/WaveRewardsScreen';
import { ProgressionMenu } from '@/components/game/ProgressionMenu';
import { HomeScreen } from '@/components/game/HomeScreen';
import { useGame } from '@/lib/game/GameContext';
import { useGameLoop } from '@/lib/game/useGameLoop';
import { useUpgrades } from '@/lib/game/useUpgrades';
import { useBossWaves } from '@/lib/game/useBossWaves';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showCamp, setShowCamp] = useState(false);

  useGameLoop();
  useUpgrades();
  useBossWaves();

  const handleStartGame = () => {
    setShowCamp(false);
    setShowRewards(false);
    dispatch({ type: 'INIT_GAME' });
    setGameStarted(true);
  };

  const handleOpenCamp = () => {
    setGameStarted(false);
    setShowCamp(true);
  };

  const handleRestartGame = () => {
    setShowCamp(false);
    setShowRewards(false);
    dispatch({ type: 'INIT_GAME' });
    setGameStarted(true);
  };

  const handleReturnHome = () => {
    setShowCamp(false);
    setShowRewards(false);
    setGameStarted(false);
  };

  if (showCamp) {
    return <ProgressionMenu onStartGame={handleStartGame} onBack={() => setShowCamp(false)} />;
  }

  if (!gameStarted) {
    return <HomeScreen onStartGame={handleStartGame} onOpenCamp={handleOpenCamp} />;
  }

  if (state.gameLost || state.plantationHealth <= 0) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center p-6 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-4xl font-bold text-foreground">Game Over!</Text>
            <Text className="max-w-sm text-center text-base text-muted">
              Um inimigo alcançou o farol e a plantação ficou sem vida.
            </Text>
            <View className="w-full max-w-sm rounded-2xl border border-[#E27D6A] bg-[#FFF0EC] px-4 py-3">
              <Text className="text-center text-sm font-black text-[#9E3F2B]">FAROL SEM VIDA
</Text>
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
              accessibilityRole="button"
              accessibilityLabel="Jogar novamente"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View className="items-center rounded-full bg-primary px-8 py-4">
                <Text className="text-background font-bold text-lg">Jogar Novamente</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleOpenCamp}
              accessibilityRole="button"
              accessibilityLabel="Abrir Acampamento"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View className="items-center rounded-full border border-[#8EAF6D] bg-[#EAF4D8] px-8 py-3">
                <Text className="font-bold text-[#376333]">Abrir Acampamento</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleReturnHome}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a Home"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View className="items-center px-8 py-2">
                <Text className="font-bold text-[#52664C]">Voltar para Home</Text>
              </View>
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
