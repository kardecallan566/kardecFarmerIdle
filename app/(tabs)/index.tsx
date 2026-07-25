import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { GameProvider, useGame } from '@/lib/game/GameContext';
import { GameMap } from '@/components/game/GameMap';
import { GameHUD } from '@/components/game/GameHUD';
import { CardBar } from '@/components/game/CardBar';
import { WaveRewardsScreen } from '@/components/game/WaveRewardsScreen';
import { useGameLoop } from '@/lib/game/useGameLoop';
import { useUpgrades } from '@/lib/game/useUpgrades';
import { useBossWaves } from '@/lib/game/useBossWaves';
import { saveBestWave, incrementTotalGames, addTotalEnemiesDefeated, addTotalCoinsEarned } from '@/lib/game/storage';

function GameScreenContent() {
  const { state, dispatch } = useGame();
  useGameLoop();
  useUpgrades();
  useBossWaves();
  const [gameStarted, setGameStarted] = useState(false);
  const [bestWave, setBestWave] = useState(0);

  // Load best wave on mount
  useEffect(() => {
    saveBestWave(state.wave);
  }, [state.wave]);

  // Save stats on game over
  useEffect(() => {
    if (state.gameLost) {
      incrementTotalGames();
      addTotalEnemiesDefeated(state.totalEnemiesDefeated);
      addTotalCoinsEarned(Math.floor(state.totalCoinsEarned));
    }
  }, [state.gameLost]);

  // Show game over screen
  if (state.gameLost) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center bg-background p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-4xl font-bold text-error">Game Over</Text>

            <View className="bg-surface rounded-lg p-6 gap-4 w-full max-w-sm">
              <View className="gap-2">
                <Text className="text-lg font-semibold text-foreground">Estatísticas da Partida</Text>
                <View className="gap-1 bg-background rounded p-3">
                  <Text className="text-sm text-foreground">
                    Wave alcançada: <Text className="font-bold text-warning">{state.wave}</Text>
                  </Text>
                  <Text className="text-sm text-foreground">
                    Inimigos derrotados: <Text className="font-bold text-success">{state.totalEnemiesDefeated}</Text>
                  </Text>
                  <Text className="text-sm text-foreground">
                    Moedas coletadas: <Text className="font-bold text-primary">{Math.floor(state.totalCoinsEarned)}</Text>
                  </Text>
                  <Text className="text-sm text-foreground mt-2 pt-2 border-t border-border">
                    Guardas colocados: <Text className="font-bold">{state.guards.length}</Text>
                  </Text>
                </View>
              </View>

              <View className="gap-2 bg-primary/10 rounded p-3 border border-primary">
                <Text className="text-xs font-semibold text-primary">Dicas para próxima partida:</Text>
                <Text className="text-xs text-muted">
                  • Coloque guardas estrategicamente nos caminhos
                </Text>
                <Text className="text-xs text-muted">
                  • Escolha melhorias que complementem sua estratégia
                </Text>
                <Text className="text-xs text-muted">
                  • Prepare-se para Bosses a cada 5 waves!
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  dispatch({ type: 'INIT_GAME' });
                  setGameStarted(false);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <View className="bg-primary rounded-lg py-3 px-6 items-center">
                  <Text className="text-white font-bold text-lg">Reiniciar Jogo</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show home screen if game not started
  if (!gameStarted && state.wave === 1 && state.enemies.length === 0) {
    return (
      <ScreenContainer className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center p-6 gap-8">
            {/* Title */}
            <View className="gap-2 items-center">
              <Text className="text-5xl font-bold text-primary">🌾</Text>
              <Text className="text-4xl font-bold text-foreground text-center">
                Kardec Farmer Idle TD
              </Text>
              <Text className="text-lg text-muted text-center">
                Defenda sua plantação contra ondas de inimigos
              </Text>
            </View>

            {/* Game Description */}
            <View className="bg-surface rounded-lg p-6 gap-3 w-full">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Como Jogar:</Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Coloque guardas para defender sua plantação
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Ganhe moedas derrotando inimigos
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Escolha melhorias entre as ondas (estilo roguelike)
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Sobreviva o máximo de ondas possível
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Cuidado com Bosses a cada 5 waves!
                </Text>
              </View>
            </View>

            {/* Guardas Info */}
            <View className="bg-surface rounded-lg p-4 gap-2 w-full">
              <Text className="text-sm font-semibold text-foreground">Tipos de Guardas:</Text>
              <View className="gap-1">
                <Text className="text-xs text-muted">🗡️ Guerreiro - Equilibrado (100 moedas)</Text>
                <Text className="text-xs text-muted">🏹 Arqueiro - Longo alcance (120 moedas)</Text>
                <Text className="text-xs text-muted">🛡️ Tanque - Resistente (150 moedas)</Text>
              </View>
            </View>

            {/* Start Button */}
            <Pressable
              onPress={() => setGameStarted(true)}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="bg-primary rounded-lg py-4 px-12 items-center">
                <Text className="text-white font-bold text-xl">Iniciar Jogo</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show game screen
  return (
    <ScreenContainer className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <GameHUD />
      <GameMap />
      <CardBar />
      <WaveRewardsScreen />
    </ScreenContainer>
  );
}

export default function GameScreenWrapper() {
  return (
    <GameProvider>
      <GameScreenContent />
    </GameProvider>
  );
}
