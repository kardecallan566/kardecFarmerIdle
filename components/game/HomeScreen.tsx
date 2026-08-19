import { Image, ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { getIdleGoldRate, getNextBossWave, getWaveConfig } from '@/lib/game/types';
import { useGame } from '@/lib/game/GameContext';
import { GameIcon } from './GameIcon';
import { CurrencyIcon } from './CurrencyIcon';

const GAME_LOGO = require('@/assets/images/logo-kardec-farmer.png');
const FOREST_VILLAGE_BACKGROUND = require('@/assets/images/forest-village-background.png');

interface HomeScreenProps {
  onStartGame?: () => void;
  onOpenCamp?: () => void;
}

export function HomeScreen({ onStartGame, onOpenCamp }: HomeScreenProps) {
  const { state } = useGame();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const firstWave = getWaveConfig(1);
  const nextBossWave = getNextBossWave(1);

  return (
    <ImageBackground
      source={FOREST_VILLAGE_BACKGROUND}
      resizeMode="cover"
      imageStyle={{ opacity: 0.32 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          padding: isCompact ? 16 : 22,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 w-full max-w-[430px] justify-center gap-4">
          <View className="items-center">
            <Image
              source={GAME_LOGO}
              accessibilityLabel="Emblema de trigo e defesa agrícola"
              style={{ width: isCompact ? 104 : 128, height: isCompact ? 104 : 128 }}
              resizeMode="contain"
            />
            <Text className="mt-1 text-center text-3xl font-black tracking-tight text-[#18251A]">
              Kardec Farmer
            </Text>
            <Text className="text-center text-base font-bold text-[#476246]">
              Tower Defense agrícola
            </Text>
            <Text className="mt-1 text-center text-xs text-[#6F765F]">
              Organize suas tropas, proteja o farol e resista no bosque da vila.
            </Text>
          </View>

          <View className="rounded-3xl border border-[#D3B98B] bg-[#FFF9EA]/95 p-4 shadow-lg">
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] font-black tracking-widest text-[#7D6947]">BRIEFING DA ARENA</Text>
                <Text className="mt-1 text-lg font-black text-[#243D25]">Prepare sua defesa</Text>
              </View>
              <View className="rounded-2xl bg-[#E9F3D6] p-2">
                <GameIcon name="wave" size={26} color="#4C8DDB" secondaryColor="#8DCB63" />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 rounded-2xl border border-[#DDE8C8] bg-[#F5F9EC] p-3">
                <Text className="text-[10px] font-bold text-[#71835E]">PRIMEIRA WAVE</Text>
                <Text className="mt-1 text-xl font-black text-[#294F2E]">Wave 1</Text>
                <Text className="mt-1 text-[10px] leading-4 text-[#71835E]">{firstWave.enemyCount} inimigos entram na estrada.</Text>
              </View>
              <View className="flex-1 rounded-2xl border border-[#F1DBAB] bg-[#FFF7DE] p-3">
                <Text className="text-[10px] font-bold text-[#9A7740]">PRÓXIMO CHEFE</Text>
                <Text className="mt-1 text-xl font-black text-[#8B4F2C]">Wave {nextBossWave}</Text>
                <Text className="mt-1 text-[10px] leading-4 text-[#9A7740]">A cada 5 waves aparece um monstro chefe.</Text>
              </View>
            </View>
          </View>

          <View className="rounded-3xl border border-[#D3B98B] bg-[#FFF9EA]/95 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-black tracking-widest text-[#7D6947]">PROGRESSO CONTÍNUO</Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <CurrencyIcon type="campGold" size={24} />
                  <Text className="flex-1 text-base font-black text-[#294F2E]">{Math.floor(state.bankGold)} ouro do Acampamento</Text>
                </View>
              </View>
              <Text className="text-sm font-black text-[#8B4F2C]">Wave {state.bestWave}</Text>
            </View>
            <Text className="mt-2 text-[10px] leading-4 text-[#71835E]">{state.unlockedTroops.length}/3 tropas desbloqueadas. Derrote monstros, resgate a run, compre suprimentos durante a wave e treine sua defesa.</Text>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-xl border border-[#F1DBAB] bg-[#FFF7DE] px-3 py-2">
                <View className="flex-row items-center gap-1"><CurrencyIcon type="campGold" size={15} /><Text className="text-[9px] font-black text-[#9A7740]">OURO OCIOSO</Text></View>
                <Text className="mt-0.5 text-sm font-black text-[#8B4F2C]">+{Math.floor(state.idleGoldAvailable)}</Text>
                <Text className="text-[9px] text-[#9A7740]">{getIdleGoldRate(state.idleUpgradeLevel)} por minuto</Text>
              </View>
              <View className="flex-1 rounded-xl border border-[#C8DCE8] bg-[#F1F8FC] px-3 py-2">
                <Text className="text-[9px] font-black text-[#5F7990]">BESTIÁRIO</Text>
                <Text className="mt-0.5 text-sm font-black text-[#2D5367]">{Object.values(state.bestiaryDefeated).filter((count) => count > 0).length}/9</Text>
                <Text className="text-[9px] text-[#68859A]">espécies descobertas</Text>
              </View>
            </View>
            <Text className="mt-2 text-[10px] leading-4 text-[#71835E]">Tecnologia: {Object.values(state.technologyLevels).reduce((sum, level) => sum + level, 0)}/15 • Ascensão {state.ascensionLevel} • Essência {state.forestEssence}</Text>
          </View>

          <View className="rounded-3xl border border-[#B8CDE0] bg-[#F1F8FC]/95 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-black tracking-widest text-[#5F7990]">DECISÕES DE DEFESA</Text>
                <Text className="mt-1 text-lg font-black text-[#2D5367]">Prepare-se para o boss</Text>
              </View>
              <Text className="rounded-full bg-[#D9EEF7] px-2 py-1 text-[9px] font-black text-[#3E7594]">RELÍQUIAS</Text>
            </View>
            <Text className="mt-2 text-xs leading-4 text-[#68859A]">A cada 5 waves, um boss encerra a era atual. Derrote-o para pausar a run e escolher uma relíquia: dano vence brutos, alcance controla corredores e vida segura a linha de frente.</Text>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-xl bg-[#F7E5E0] p-2"><Text className="text-[9px] font-black text-[#A74D3D]">FRENTE</Text><Text className="mt-1 text-[9px] leading-3 text-[#9B6559]">Guerreiro segura o centro.</Text></View>
              <View className="flex-1 rounded-xl bg-[#E1F0D9] p-2"><Text className="text-[9px] font-black text-[#4E8145]">ALCANCE</Text><Text className="mt-1 text-[9px] leading-3 text-[#63815D]">Arqueiro cobre a estrada.</Text></View>
              <View className="flex-1 rounded-xl bg-[#FFF1C8] p-2"><Text className="text-[9px] font-black text-[#9A7740]">RESERVA</Text><Text className="mt-1 text-[9px] leading-3 text-[#9A7740]">Guarde ouro para evoluir.</Text></View>
            </View>
          </View>

          <View className="rounded-3xl border border-[#C9D9BC] bg-[#F5FAEE]/95 p-4">
            <Text className="mb-3 text-sm font-black text-[#294F2E]">Como jogar</Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-[#DDECC8] p-2"><GameIcon name="health" size={18} color="#65C7F4" secondaryColor="#5D994E" /></View>
                <Text className="flex-1 text-xs leading-4 text-[#52664C]">Plante uma carta em um canteiro para criar uma tropa quando o feixe do farol iluminar o terreno.
</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-[#DDECC8] p-2"><GameIcon name="range" size={18} color="#F7C948" secondaryColor="#5D994E" /></View>
                <Text className="flex-1 text-xs leading-4 text-[#52664C]">As tropas avançam pela estrada e atacam apenas quando o inimigo entra no alcance.</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-[#DDECC8] p-2"><CurrencyIcon type="combatSupplies" size={20} /></View>
                <Text className="flex-1 text-xs leading-4 text-[#52664C]">Derrote inimigos para ganhar suprimentos de combate e prepare-se para a próxima wave.</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={onStartGame}
            accessibilityRole="button"
            accessibilityLabel="Iniciar partida"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View className="items-center rounded-2xl border-b-4 border-[#315F40] bg-[#4E8B46] px-6 py-4 shadow-lg">
              <Text className="text-lg font-black tracking-wide text-white">INICIAR DEFESA</Text>
              <Text className="mt-0.5 text-[10px] font-bold text-[#E7F4D6]">Entrar na arena</Text>
            </View>
          </Pressable>

          {onOpenCamp && (
            <Pressable
              onPress={onOpenCamp}
              accessibilityRole="button"
              accessibilityLabel="Abrir Acampamento do Farol"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View className="items-center rounded-2xl border border-[#9EBC7A] bg-[#EAF4D8]/95 px-6 py-3">
                <Text className="text-sm font-black tracking-wide text-[#376333]">ACAMPAMENTO DO FAROL</Text>
                <Text className="mt-0.5 text-[10px] font-bold text-[#71835E]">Upgrades e desbloqueios persistentes</Text>
              </View>
            </Pressable>
          )}

          <Text className="text-center text-[10px] text-[#6F765F]">Kardec Farmer Idle • Defesa da plantação em andamento</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
