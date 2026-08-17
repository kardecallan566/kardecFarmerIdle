import React, { useState } from 'react';
import { ImageBackground, View, ScrollView, Text, Pressable } from 'react-native';
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

const FOREST_VILLAGE_BACKGROUND = require('@/assets/images/forest-village-background.png');

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [showCamp, setShowCamp] = useState(false);

  useGameLoop();
  useUpgrades();
  useBossWaves();

  const handleStartGame = () => {
    setShowCamp(false);
    dispatch({ type: 'INIT_GAME' });
    setGameStarted(true);
  };

  const handleOpenCamp = () => {
    setGameStarted(false);
    setShowCamp(true);
  };

  const handleRestartGame = () => {
    setShowCamp(false);
    dispatch({ type: 'INIT_GAME' });
    setGameStarted(true);
  };

  const handleReturnHome = () => {
    setShowCamp(false);
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
      <ImageBackground source={FOREST_VILLAGE_BACKGROUND} resizeMode="cover" style={{ flex: 1 }} imageStyle={{ opacity: 0.28 }}>
        <ScreenContainer className="flex-1 bg-[#0B1710]/55">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
            <View className="mx-auto w-full max-w-[430px] items-center gap-4">
              <View className="items-center rounded-full border border-[#F0B77D] bg-[#3A211F]/90 px-4 py-2">
                <Text className="text-[10px] font-black tracking-[2px] text-[#FFD9A8]">A VILA RESISTIU ATÉ AQUI</Text>
              </View>
              <Text className="text-center text-4xl font-black text-[#FFF4D6]">O farol apagou</Text>
              <Text className="max-w-sm text-center text-sm leading-5 text-[#E8D8BE]">A próxima tentativa começa com o que você aprendeu. Reposicione suas tropas, escolha outra relíquia e tente superar a wave.</Text>

              <View className="w-full rounded-3xl border border-[#F07863]/70 bg-[#321D1A]/95 p-4">
                <Text className="text-center text-sm font-black tracking-wide text-[#FFB09A]">PLANTAÇÃO SEM VIDA</Text>
                <Text className="mt-1 text-center text-xs text-[#F4C0AE]">{Math.floor(state.plantationHealth)}/{state.maxPlantationHealth} • o inimigo alcançou o núcleo</Text>
              </View>

              <View className="w-full rounded-3xl border border-[#6F8B63] bg-[#142719]/95 p-4">
                <Text className="mb-3 text-sm font-black text-[#F7D774]">RELATÓRIO DA DEFESA</Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="min-w-[46%] flex-1 rounded-2xl bg-[#203C2B] p-3"><Text className="text-[9px] font-black text-[#9FBE9A]">WAVE</Text><Text className="mt-1 text-xl font-black text-[#FFF4D6]">{state.wave}</Text></View>
                  <View className="min-w-[46%] flex-1 rounded-2xl bg-[#203C2B] p-3"><Text className="text-[9px] font-black text-[#9FBE9A]">ABATES</Text><Text className="mt-1 text-xl font-black text-[#FFF4D6]">{state.totalEnemiesDefeated}</Text></View>
                  <View className="min-w-[46%] flex-1 rounded-2xl bg-[#203C2B] p-3"><Text className="text-[9px] font-black text-[#9FBE9A]">TROPAS</Text><Text className="mt-1 text-xl font-black text-[#FFF4D6]">{state.guards.length}</Text></View>
                  <View className="min-w-[46%] flex-1 rounded-2xl bg-[#203C2B] p-3"><Text className="text-[9px] font-black text-[#9FBE9A]">RECOMPENSA</Text><Text className="mt-1 text-xl font-black text-[#F7D774]">+{state.lastRunReward || '—'}</Text></View>
                </View>
              </View>

              <Pressable onPress={handleRestartGame} accessibilityRole="button" accessibilityLabel="Jogar novamente" style={({ pressed }) => ({ width: '100%', transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.9 : 1 })}>
                <View className="items-center rounded-2xl border-b-4 border-[#315F40] bg-[#4E8B46] px-6 py-4"><Text className="text-lg font-black tracking-wide text-white">JOGAR NOVAMENTE</Text><Text className="mt-0.5 text-[10px] font-bold text-[#E7F4D6]">Testar uma nova estratégia</Text></View>
              </Pressable>
              <View className="w-full flex-row gap-2">
                <Pressable onPress={handleOpenCamp} accessibilityRole="button" accessibilityLabel="Abrir Acampamento" style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}>
                  <View className="items-center rounded-2xl border border-[#B8D491] bg-[#EAF4D8] px-3 py-3"><Text className="text-center text-xs font-black text-[#376333]">ACAMPAMENTO</Text><Text className="mt-0.5 text-[9px] text-[#71835E]">Treinar e evoluir</Text></View>
                </Pressable>
                <Pressable onPress={handleReturnHome} accessibilityRole="button" accessibilityLabel="Voltar para a Home" style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.75 : 1 })}>
                  <View className="items-center rounded-2xl border border-[#8EAF6D] bg-[#FFF9EA] px-3 py-3"><Text className="text-center text-xs font-black text-[#52664C]">VOLTAR À HOME</Text><Text className="mt-0.5 text-[9px] text-[#71835E]">Ver progresso</Text></View>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </ImageBackground>
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
      <WaveRewardsScreen />
    </ScreenContainer>
  );
}
