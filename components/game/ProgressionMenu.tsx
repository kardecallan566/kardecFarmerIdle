import { Image, ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useGame } from '@/lib/game/GameContext';
import { BeaconUpgradeType, getBeaconStats, getGuardStats, getGuardVisualProfile, getIdleGoldRate, getIdleUpgradeCost, GUARD_CONFIGS, GuardType } from '@/lib/game/types';
import { GameIcon } from './GameIcon';
import { CurrencyIcon } from './CurrencyIcon';

const FOREST_VILLAGE_BACKGROUND = require('@/assets/images/forest-village-background.png');
const GUARD_IMAGES = {
  warrior: {
    base: require('@/assets/images/guard-warrior.png'),
    veteran: require('@/assets/images/guard-warrior-veteran-transparent.png'),
    elite: require('@/assets/images/guard-warrior-elite-transparent.png'),
    legendary: require('@/assets/images/guard-warrior-legendary-transparent.png'),
  },
  archer: {
    base: require('@/assets/images/guard-archer.png'),
    veteran: require('@/assets/images/guard-archer-veteran-transparent.png'),
    elite: require('@/assets/images/guard-archer-veteran-transparent.png'),
    legendary: require('@/assets/images/guard-archer-legendary-transparent.png'),
  },
  tank: {
    base: require('@/assets/images/guard-tank.png'),
    veteran: require('@/assets/images/guard-tank-veteran-transparent.png'),
    elite: require('@/assets/images/guard-tank-elite-transparent.png'),
    legendary: require('@/assets/images/guard-tank-legendary-transparent.png'),
  },
};

const TROOP_ORDER: GuardType[] = ['warrior', 'archer', 'tank'];
const BESTIARY_ORDER = ['normal', 'runner', 'brute', 'healer', 'boss'] as const;
const BESTIARY_NAMES = { normal: 'Batedor', runner: 'Corredor', brute: 'Bruto', healer: 'Curandeiro', boss: 'Chefe' };
const UNLOCK_COSTS: Record<GuardType, number> = { warrior: 0, archer: 180, tank: 360 };
const UPGRADE_BASE_COSTS: Record<GuardType, number> = { warrior: 120, archer: 160, tank: 200 };

const BEACON_UPGRADES: {
  type: BeaconUpgradeType;
  name: string;
  description: string;
  maxLevel: number;
  getCost: (level: number) => number;
}[] = [
  {
    type: 'lightSpeed',
    name: 'Feixe mais veloz',
    description: 'Acelera a rotação do farol em 20% por nível.',
    maxLevel: 5,
    getCost: (level) => 180 + level * 120,
  },
  {
    type: 'multiSpawn',
    name: 'Pulso duplo',
    description: 'Cada iluminação pode gerar mais de uma tropa.',
    maxLevel: 2,
    getCost: (level) => 320 + level * 220,
  },
  {
    type: 'extraSlots',
    name: 'Quartéis da vila',
    description: 'Libera novos quartéis ao redor do farol para posicionar tropas.',
    maxLevel: 4,
    getCost: (level) => 220 + level * 160,
  },
];

interface ProgressionMenuProps {
  onStartGame: () => void;
  onBack?: () => void;
}

export function ProgressionMenu({ onStartGame, onBack }: ProgressionMenuProps) {
  const { state, dispatch } = useGame();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const nextUnlock = TROOP_ORDER.find((type) => !state.unlockedTroops.includes(type));
  const beaconStats = getBeaconStats(state.beaconUpgradeLevels);

  const claimReward = () => dispatch({ type: 'CLAIM_RUN_REWARD' });

  return (
    <ImageBackground
      source={FOREST_VILLAGE_BACKGROUND}
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
              <CurrencyIcon type="campGold" size={32} />
              <Text className="mt-1 text-sm font-black text-[#6C5424]">{Math.floor(state.bankGold)}</Text>
              <Text className="text-[9px] font-bold text-[#7D6947]">OURO DO ACAMPAMENTO</Text>
            </View>
          </View>

          <View className="rounded-3xl border border-[#D2C49A] bg-[#FFFDF3]/95 p-4">
            <Text className="text-[10px] font-black tracking-[1.5px] text-[#8A7040]">DUAS ECONOMIAS</Text>
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1 rounded-2xl bg-[#F3D98C] p-3">
                <View className="flex-row items-center gap-2">
                  <CurrencyIcon type="campGold" size={24} />
                  <Text className="flex-1 text-[10px] font-black text-[#704D1B]">OURO DO ACAMPAMENTO</Text>
                </View>
                <Text className="mt-1 text-[10px] leading-4 text-[#8A7040]">Fica entre partidas e compra upgrades, tropas e quartéis.</Text>
              </View>
              <View className="flex-1 rounded-2xl bg-[#DDECC8] p-3">
                <View className="flex-row items-center gap-2">
                  <CurrencyIcon type="combatSupplies" size={24} />
                  <Text className="flex-1 text-[10px] font-black text-[#315F40]">SUPRIMENTOS DE COMBATE</Text>
                </View>
                <Text className="mt-1 text-[10px] leading-4 text-[#4C7742]">Nascem durante a wave e pagam as tropas desta defesa.</Text>
              </View>
            </View>
          </View>

          {state.gameLost && !state.runRewardClaimed && (
            <View className="rounded-3xl border border-[#E7B86A] bg-[#FFF7DE]/95 p-4">
              <Text className="text-sm font-black text-[#8B4F2C]">Recompensa da última defesa</Text>
              <Text className="mt-1 text-xs leading-4 text-[#9A7740]">Converta o desempenho da partida em ouro permanente para comprar melhorias.</Text>
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
              <Text className="mt-1 text-xs text-[#5D7D4E]">+{state.lastRunReward} ouro do Acampamento. Use-o para desbloquear a próxima tropa.</Text>
            </View>
          )}

          <View className="rounded-3xl border border-[#B8C99A] bg-[#F8F3DE]/95 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-black tracking-[1.5px] text-[#8A7040]">COLHEITA OCIOSA</Text>
                <Text className="mt-1 text-lg font-black text-[#5B4827]">O bosque trabalha por você</Text>
                <Text className="mt-1 text-xs leading-4 text-[#8A7040]">Enquanto você estiver fora, a vila acumula ouro do Acampamento por até 8 horas.</Text>
              </View>
              <View className="ml-3 items-center rounded-2xl bg-[#F3D98C] px-3 py-2">
                <Text className="text-xl font-black text-[#704D1B]">+{state.idleGoldAvailable}</Text>
                <Text className="text-[9px] font-black text-[#8A7040]">OURO OCIOSO</Text>
              </View>
            </View>
            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={() => dispatch({ type: 'CLAIM_IDLE_GOLD' })}
                disabled={state.idleGoldAvailable <= 0}
                accessibilityRole="button"
                accessibilityLabel="Resgatar ouro ocioso"
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : state.idleGoldAvailable > 0 ? 1 : 0.55 })}
              >
                <View className="items-center rounded-xl bg-[#B97925] px-3 py-2.5">
                  <View className="flex-row items-center gap-1.5"><CurrencyIcon type="campGold" size={16} /><Text className="text-[10px] font-black text-white">RESGATAR OURO</Text></View>
                  <Text className="mt-0.5 text-[9px] font-bold text-[#FFF1C8]">{getIdleGoldRate(state.idleUpgradeLevel)} ouro/min</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => dispatch({ type: 'BUY_IDLE_UPGRADE', goldCost: getIdleUpgradeCost(state.idleUpgradeLevel) })}
                disabled={state.idleUpgradeLevel >= 5 || state.bankGold < getIdleUpgradeCost(state.idleUpgradeLevel)}
                accessibilityRole="button"
                accessibilityLabel="Melhorar colheita ociosa"
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}
              >
                <View className="items-center rounded-xl bg-[#6E8D47] px-3 py-2.5">
                  <Text className="text-[10px] font-black text-white">{state.idleUpgradeLevel >= 5 ? 'IDLE MÁXIMO' : `MELHORAR • ${getIdleUpgradeCost(state.idleUpgradeLevel)}`}</Text>
                  <Text className="mt-0.5 text-[9px] font-bold text-[#E7F4D6]">Nível {state.idleUpgradeLevel}/5</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View className="rounded-3xl border border-[#B8CDE0] bg-[#F1F8FC]/95 p-4">
            <Text className="text-[10px] font-black tracking-[1.5px] text-[#5F7990]">BESTIÁRIO DO BOSQUE</Text>
            <Text className="mt-1 text-lg font-black text-[#2D5367]">Conheça seus inimigos</Text>
            <Text className="mt-1 text-xs leading-4 text-[#68859A]">Cada nova espécie descoberta rende uma recompensa e revela sua estratégia.</Text>
            <View className="mt-3 gap-2">
              {BESTIARY_ORDER.map((kind) => {
                const defeated = state.bestiaryDefeated[kind];
                const discovered = defeated > 0;
                return (
                  <View key={kind} className="flex-row items-center justify-between rounded-xl border border-[#C8DCE8] bg-white/70 px-3 py-2">
                    <View className="flex-row items-center gap-2">
                      <View className={`h-3 w-3 rounded-full ${discovered ? 'bg-[#5B8FD1]' : 'bg-[#B9C8D1]'}`} />
                      <Text className="text-xs font-black text-[#36576A]">{BESTIARY_NAMES[kind]}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-[#6A879A]">{discovered ? `${defeated} derrotados` : 'Ainda não encontrado'}</Text>
                  </View>
                );
              })}
            </View>
          </View>

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

          <View className="rounded-3xl border border-[#B8C99A] bg-[#F1F8E8]/95 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-black tracking-[1.5px] text-[#71835E]">EVOLUÇÃO DO FAROL</Text>
                <Text className="mt-1 text-lg font-black text-[#294F2E]">Mais luz, mais defesa</Text>
                <Text className="mt-1 text-xs leading-4 text-[#71835E]">Aprimore a estrutura central para acelerar a geração e abrir novos quartéis.</Text>
              </View>
              <View className="ml-3 items-center rounded-2xl bg-[#DDECC8] px-3 py-2">
                <Text className="text-xl font-black text-[#315F40]">{beaconStats.spawnBatch}x</Text>
                <Text className="text-[9px] font-black text-[#71835E]">PULSO</Text>
              </View>
            </View>

            {BEACON_UPGRADES.map((upgrade) => {
              const level = state.beaconUpgradeLevels[upgrade.type];
              const isMaxed = level >= upgrade.maxLevel;
              const goldCost = upgrade.getCost(level);
              const canBuy = !isMaxed && state.bankGold >= goldCost;
              const valueLabel = upgrade.type === 'lightSpeed'
                ? `Velocidade do feixe: +${level * 20}%`
                : upgrade.type === 'multiSpawn'
                  ? `Geração por pulso: ${beaconStats.spawnBatch} tropa(s)`
                  : `Quartéis ativos: ${beaconStats.unlockedPlotCount}/8`;

              return (
                <View key={upgrade.type} className="mt-3 rounded-2xl border border-[#C9D9BC] bg-[#F9FCEB] p-3">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-black text-[#294F2E]">{upgrade.name}</Text>
                        <Text className="rounded-full bg-[#DDECC8] px-2 py-0.5 text-[9px] font-black text-[#4C7742]">LV {level}/{upgrade.maxLevel}</Text>
                      </View>
                      <Text className="mt-1 text-[10px] leading-4 text-[#71835E]">{upgrade.description}</Text>
                      <Text className="mt-1 text-[10px] font-bold text-[#4C7742]">{valueLabel}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => dispatch({ type: 'BUY_BEACON_UPGRADE', upgradeType: upgrade.type, goldCost })}
                    disabled={!canBuy}
                    accessibilityRole="button"
                    accessibilityLabel={`Melhorar ${upgrade.name}`}
                    style={({ pressed }) => ({
                      marginTop: 10,
                      transform: [{ scale: pressed && canBuy ? 0.98 : 1 }],
                      opacity: pressed && canBuy ? 0.9 : 1,
                    })}
                  >
                    <View className={`items-center rounded-xl px-3 py-2.5 ${isMaxed ? 'bg-[#8AA47A]' : canBuy ? 'bg-[#315F40]' : 'bg-[#A6B39A]'}`}>
                        <View className="flex-row items-center gap-1.5"><CurrencyIcon type="campGold" size={16} /><Text className="text-[10px] font-black text-white">{isMaxed ? 'MÁXIMO ALCANÇADO' : `MELHORAR • ${goldCost} OURO`}</Text></View>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View className="gap-2">
            {TROOP_ORDER.map((troopType) => {
              const config = GUARD_CONFIGS[troopType];
              const unlocked = state.unlockedTroops.includes(troopType);
              const level = state.troopUpgradeLevels[troopType];
              const stats = getGuardStats(troopType, level);
              const visual = getGuardVisualProfile(troopType, level);
              const unlockCost = UNLOCK_COSTS[troopType];
              const upgradeCost = UPGRADE_BASE_COSTS[troopType] * (level + 1);
              const canBuyUnlock = state.bankGold >= unlockCost;
              const canBuyUpgrade = state.bankGold >= upgradeCost;

              return (
                <View key={troopType} className={`rounded-3xl border-2 p-3 ${unlocked ? 'border-[#B8D491] bg-[#F5FAEE]/95' : 'border-[#D7C9AA] bg-[#FFF9EA]/90'}`}>
                  <View className="flex-row items-center gap-3">
                    <View className="rounded-2xl bg-[#E5EFD7] p-2">
                      <Image source={GUARD_IMAGES[troopType][visual.tier]} style={{ width: 56, height: 56, borderColor: visual.armorColor, borderWidth: visual.tier === 'base' ? 0 : 1, borderRadius: 14 }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-black text-[#294F2E]">{config.name}</Text>
                        <Text style={{ color: visual.accentColor }} className="text-[9px] font-black">{visual.title}</Text>
                        <Text className="rounded-full bg-[#DDECC8] px-2 py-0.5 text-[9px] font-black text-[#4C7742]">{visual.badge} • LV {level + 1}</Text>
                      </View>
                      <Text className="mt-1 text-[10px] leading-4 text-[#71835E]">Vida {stats.health} • Dano {stats.damage} • Alcance {stats.range}</Text>
                      <Text style={{ color: visual.armorColor }} className="mt-0.5 text-[9px] font-bold">Armadura evolutiva • {visual.tier}</Text>
                    </View>
                  </View>

                  {!unlocked ? (
                    <Pressable
                      onPress={() => dispatch({ type: 'UNLOCK_TROOP', troopType, goldCost: unlockCost })}
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
                        <View className="flex-row items-center gap-1.5"><CurrencyIcon type="campGold" size={17} /><Text className="text-xs font-black text-white">DESBLOQUEAR POR {unlockCost} OURO</Text></View>
                        <Text className="mt-0.5 text-[9px] font-bold text-[#E7F4D6]">{nextUnlock === troopType ? 'Próxima meta' : 'Complete a ordem de desbloqueio'}</Text>
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => dispatch({ type: 'BUY_TROOP_UPGRADE', troopType, goldCost: upgradeCost })}
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
                        <View className="flex-row items-center gap-1.5"><CurrencyIcon type="campGold" size={17} /><Text className="text-xs font-black text-white">TREINAR +12% • {upgradeCost} OURO</Text></View>
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
