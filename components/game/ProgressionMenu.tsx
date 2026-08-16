import { Image, ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { GUARD_CONFIGS, GuardType } from '@/lib/game/types';
import { GameIcon } from './GameIcon';

const FARM_BACKGROUND = require('@/assets/images/farm-background.png');
const GUARD_IMAGES = {
  warrior: require('@/assets/images/guard-warrior.png'),
  archer: require('@/assets/images/guard-archer.png'),
  tank: require('@/assets/images/guard-tank.png'),
};

const TROOP_ORDER: GuardType[] = ['warrior', 'archer', 'tank'];
const UNLOCK_COSTS: Record<GuardType, number> = { warrior: 0, archer: 180, tank: 360 };
const UPGRADE_BASE_COSTS: Record<GuardType, number> = { warrior: 120, archer: 160, tank: 200 };

interface ProgressionMenuProps {
  onStartGame: () => void;
  onBack?: () => void;
}

export function ProgressionMenu({ onStartGame, onBack }: ProgressionMenuProps) {
  const { state, dispatch } = useGame();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const nextUnlock = TROOP_ORDER.find((type) => !state.unlockedTroops.includes(type));

  const claimReward = () => dispatch({ type: 'CLAIM_RUN_REWARD' });

  return (
    <ImageBackground
      source={FARM_BACKGROUND}
      resizeMode="cover"
      imageStyle={{ opacity: 0.3 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          padding: isCompact ? 14 : 20,
        }}
      >
        <View className="w-full max-w-[460px] gap-3">
          <View className="flex-row items-center justify-between rounded-3xl border border-[#D3B98B] bg-[#FFF9EA]/95 px-4 py-4">
            <View className="flex-1">
              <Text className="text-[10px] font-black tracking-[2px] text-[#7D6947]">ACAMPAMENTO DO FAROL</Text>
              <Text className="mt-1 text-2xl font-black text-[#243D25]">Prepare a próxima defesa</Text>
              <Text className="mt-1 text-xs text-[#71835E]">Desbloqueie novas funções e torne cada run mais forte.</Text>
            </View>
            <View className="items-center rounded-2xl bg-[#E9F3D6] px-3 py-2">
              <GameIcon name="coin" size={24} color="#F7C948" secondaryColor="#7D4E1F" />
              <Text className="mt-1 text-sm font-black text-[#6C5424]">{Math.floor(state.bankGold)}</Text>
              <Text className="text-[9px] font-bold text-[#7D6947]">GOLD</Text>
            </View>
          </View>

          {state.gameLost && !state.runRewardClaimed && (
            <View className="rounded-3xl border border-[#E7B86A] bg-[#FFF7DE]/95 p-4">
              <Text className="text-sm font-black text-[#8B4F2C]">Recompensa da última defesa</Text>
              <Text className="mt-1 text-xs leading-4 text-[#9A7740]">Converta o desempenho da partida em gold permanente para comprar melhorias.</Text>
              <Pressable
                onPress={claimReward}
                accessibilityRole="button"
                accessibilityLabel="Resgatar recompensa da última defesa"
                style={({ pressed }) => ({
                  marginTop: 12,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View className="items-center rounded-2xl border-b-4 border-[#A26826] bg-[#D49B3C] px-4 py-3">
                  <Text className="text-sm font-black text-white">RESGATAR RECOMPENSA</Text>
                  <Text className="mt-0.5 text-[10px] font-bold text-[#FFF1C8]">Wave {state.wave} • {state.totalEnemiesDefeated} inimigos derrotados</Text>
                </View>
              </Pressable>
            </View>
          )}

          {state.gameLost && state.runRewardClaimed && (
            <View className="rounded-3xl border border-[#B8D491] bg-[#F4FAE9]/95 p-4">
              <Text className="text-sm font-black text-[#376333]">Recompensa depositada</Text>
              <Text className="mt-1 text-xs text-[#5D7D4E]">+{state.lastRunReward} gold permanente. Use-o para desbloquear a próxima tropa.</Text>
            </View>
          )}

          <View className="rounded-3xl border border-[#C9D9BC] bg-[#F5FAEE]/95 p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] font-black tracking-[1.5px] text-[#71835E]">PROGRESSO DA CONTA</Text>
                <Text className="mt-1 text-lg font-black text-[#294F2E]">Wave máxima: {state.bestWave}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-bold text-[#71835E]">PARTIDAS</Text>
                <Text className="text-lg font-black text-[#294F2E]">{state.totalGames}</Text>
              </View>
            </View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#DCEAC8]">
              <View className="h-full rounded-full bg-[#78B84A]" style={{ width: `${(state.unlockedTroops.length / TROOP_ORDER.length) * 100}%` }} />
            </View>
            <Text className="mt-1 text-[10px] text-[#71835E]">{state.unlockedTroops.length}/{TROOP_ORDER.length} tropas disponíveis</Text>
          </View>

          <View className="gap-2">
            {TROOP_ORDER.map((troopType) => {
              const config = GUARD_CONFIGS[troopType];
              const unlocked = state.unlockedTroops.includes(troopType);
              const level = state.troopUpgradeLevels[troopType];
              const unlockCost = UNLOCK_COSTS[troopType];
              const upgradeCost = UPGRADE_BASE_COSTS[troopType] * (level + 1);
              const canBuyUnlock = state.bankGold >= unlockCost;
              const canBuyUpgrade = state.bankGold >= upgradeCost;

              return (
                <View key={troopType} className={`rounded-3xl border-2 p-3 ${unlocked ? 'border-[#B8D491] bg-[#F5FAEE]/95' : 'border-[#D7C9AA] bg-[#FFF9EA]/90'}`}>
                  <View className="flex-row items-center gap-3">
                    <View className="rounded-2xl bg-[#E5EFD7] p-2">
                      <Image source={GUARD_IMAGES[troopType]} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-black text-[#294F2E]">{config.name}</Text>
                        <Text className="rounded-full bg-[#DDECC8] px-2 py-0.5 text-[9px] font-black text-[#4C7742]">LV {level + 1}</Text>
                      </View>
                      <Text className="mt-1 text-[10px] leading-4 text-[#71835E]">Vida {config.health} • Dano {config.damage} • Alcance {config.range}</Text>
                    </View>
                  </View>

                  {!unlocked ? (
                    <Pressable
                      onPress={() => dispatch({ type: 'UNLOCK_TROOP', troopType, cost: unlockCost })}
                      disabled={!canBuyUnlock}
                      accessibilityRole="button"
                      accessibilityLabel={`Desbloquear ${config.name}`}
                      style={({ pressed }) => ({
                        marginTop: 12,
                        transform: [{ scale: pressed && canBuyUnlock ? 0.98 : 1 }],
                        opacity: pressed && canBuyUnlock ? 0.9 : 1,
                      })}
                    >
                      <View className={`items-center rounded-2xl px-3 py-2.5 ${canBuyUnlock ? 'bg-[#4E8B46]' : 'bg-[#A6B39A]'}`}>
                        <Text className="text-xs font-black text-white">DESBLOQUEAR POR {unlockCost} GOLD</Text>
                        <Text className="mt-0.5 text-[9px] font-bold text-[#E7F4D6]">{nextUnlock === troopType ? 'Próxima meta' : 'Complete a ordem de desbloqueio'}</Text>
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => dispatch({ type: 'BUY_TROOP_UPGRADE', troopType, cost: upgradeCost })}
                      disabled={!canBuyUpgrade}
                      accessibilityRole="button"
                      accessibilityLabel={`Treinar ${config.name}`}
                      style={({ pressed }) => ({
                        marginTop: 12,
                        transform: [{ scale: pressed && canBuyUpgrade ? 0.98 : 1 }],
                        opacity: pressed && canBuyUpgrade ? 0.9 : 1,
                      })}
                    >
                      <View className={`flex-row items-center justify-center gap-2 rounded-2xl px-3 py-2.5 ${canBuyUpgrade ? 'bg-[#315F40]' : 'bg-[#A6B39A]'}`}>
                        <GameIcon name="damage" size={15} color="#F7D774" secondaryColor="#E7A93B" />
                        <Text className="text-xs font-black text-white">TREINAR +12% • {upgradeCost} GOLD</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={onStartGame}
            accessibilityRole="button"
            accessibilityLabel="Voltar à arena"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View className="items-center rounded-2xl border-b-4 border-[#315F40] bg-[#4E8B46] px-6 py-4">
              <Text className="text-lg font-black tracking-wide text-white">VOLTAR À ARENA</Text>
              <Text className="mt-0.5 text-[10px] font-bold text-[#E7F4D6]">Continue a próxima defesa</Text>
            </View>
          </Pressable>

          {onBack && (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao menu principal"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="items-center py-2">
                <Text className="text-xs font-bold text-[#52664C]">Voltar ao menu principal</Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
