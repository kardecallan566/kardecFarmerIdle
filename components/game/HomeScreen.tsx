import React from 'react';
import { Image, ImageBackground, View, Text, Pressable, ScrollView } from 'react-native';
import { useGame } from '@/lib/game/GameContext';

const GAME_LOGO = require('@/assets/images/logo-kardec-farmer.png');
const FARM_BACKGROUND = require('@/assets/images/farm-background.png');

interface HomeScreenProps {
  onStartGame?: () => void;
}

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { dispatch } = useGame();

  const handleStartGame = () => {
    dispatch({ type: 'INIT_GAME' });
    onStartGame?.();
  };

  return (
    <ImageBackground
      source={FARM_BACKGROUND}
      resizeMode="cover"
      imageStyle={{ opacity: 0.28 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-background/75 justify-center items-center p-6 gap-8">
          {/* Title */}
          <View className="gap-2 items-center">
            <Image
              source={GAME_LOGO}
              accessibilityLabel="Emblema de trigo e defesa agrícola"
              style={{ width: 132, height: 132 }}
              resizeMode="contain"
            />
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
            Versão 1.0 • Defesa da plantação em andamento
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
