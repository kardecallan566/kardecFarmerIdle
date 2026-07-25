import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useGame } from '@/lib/game/GameContext';

export function HomeScreen() {
  const { dispatch } = useGame();

  const handleStartGame = () => {
    dispatch({ type: 'INIT_GAME' });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-gradient-to-b from-primary/20 to-background justify-center items-center p-6 gap-8">
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
        <View className="bg-surface rounded-lg p-6 gap-3 max-w-sm">
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Como Jogar:</Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Coloque guardas para defender sua plantação
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Ganhe moedas derrotando inimigos
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Escolha melhorias entre as ondas
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Sobreviva o máximo de ondas possível
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <Pressable
          onPress={handleStartGame}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View className="bg-primary rounded-lg py-4 px-12 items-center shadow-lg">
            <Text className="text-white font-bold text-xl">Iniciar Jogo</Text>
          </View>
        </Pressable>

        {/* Footer */}
        <Text className="text-xs text-muted mt-4">
          Versão 1.0 • Desenvolvido com Expo
        </Text>
      </View>
    </ScrollView>
  );
}
