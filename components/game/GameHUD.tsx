import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getBeaconStats, getNextBossWave, getWavesUntilBoss } from '@/lib/game/types';
import { getFormationDefinition } from '@/lib/game/formations';
import { useGame } from '@/lib/game/GameContext';
import { GameIcon } from './GameIcon';
import { CurrencyIcon } from './CurrencyIcon';

export function GameHUD() {
  const { state, dispatch } = useGame();
  const nextBossWave = getNextBossWave(state.wave);
  const wavesUntilBoss = getWavesUntilBoss(state.wave);
  const healthPercent = Math.max(
    0,
    Math.min(100, (state.plantationHealth / state.maxPlantationHealth) * 100),
  );
  const spawnPercent = state.waveEnemiesTotal > 0
    ? Math.min(100, (state.waveEnemiesSpawned / state.waveEnemiesTotal) * 100)
    : 0;
  const isBossWave = wavesUntilBoss === 0;
  const beaconStats = getBeaconStats(state.beaconUpgradeLevels);
  const activePlotCount = state.plots.filter((plot) => plot.unlocked).length;
  const previousHealthRef = useRef(state.plantationHealth);
  const [damageNotice, setDamageNotice] = useState<number | null>(null);

  useEffect(() => {
    const previousHealth = previousHealthRef.current;
    if (state.plantationHealth < previousHealth) {
      setDamageNotice(Math.ceil(previousHealth - state.plantationHealth));
      const timeout = setTimeout(() => setDamageNotice(null), 1000);
      previousHealthRef.current = state.plantationHealth;
      return () => clearTimeout(timeout);
    }
    previousHealthRef.current = state.plantationHealth;
  }, [state.plantationHealth]);

  return (
    <View className="bg-[#102A1D] border-b border-[#315F40] px-3 pt-2.5 pb-2">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-1.5">
            <GameIcon name="wave" size={18} color="#F7C948" secondaryColor="#8DCB63" />
            <Text numberOfLines={1} className="text-sm font-black tracking-wide text-[#FFF3C4]">
              WAVE {state.wave}
            </Text>
            {isBossWave && (
              <View className="rounded-full bg-[#9E3F2B] px-1.5 py-0.5">
                <Text className="text-[9px] font-black text-[#FFE7C2]">CHEFE</Text>
              </View>
            )}
          </View>
          <Text numberOfLines={1} className="text-[10px] text-[#B6D3B0]">
            {isBossWave ? 'O chefe está nesta arena' : `Próximo chefe: wave ${nextBossWave} (${wavesUntilBoss} waves)`}
          </Text>
        </View>

        <View className="items-end gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <CurrencyIcon type="combatSupplies" size={20} />
            <Text className="text-sm font-black text-[#FFF3C4]">{Math.floor(state.combatCoins)}</Text>
          </View>
          <Text className="text-[9px] font-black text-[#B6D3B0]">SUPRIMENTOS</Text>
          <View className="flex-row items-center gap-1">
            <CurrencyIcon type="campGold" size={13} />
            <Text className="text-[8px] font-bold text-[#F7D774]">{Math.floor(state.bankGold)} OURO</Text>
          </View>
        </View>
      </View>

      <View className="mt-2 flex-row items-center justify-between rounded-xl border border-[#3E6849] bg-[#0B2419] px-2.5 py-1.5">
        <Text className="text-[10px] font-bold text-[#B6D3B0]">FAROL CENTRAL</Text>
          <Text className="text-[10px] font-black text-[#F7D774]">
          Pulso {beaconStats.spawnBatch}x • {activePlotCount}/8 quartéis
        </Text>
      </View>

      {damageNotice !== null && (
        <View className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-[#F07863] bg-[#6F2B28] px-3 py-1.5">
          <GameIcon name="health" size={16} color="#FFD1C9" secondaryColor="#F07863" />
          <Text className="text-[10px] font-black tracking-wide text-[#FFE4DF]">
            PLANTAÇÃO ATINGIDA  −{damageNotice} VIDA
          </Text>
        </View>
      )}

      <View className="mt-2 flex-row gap-2">
        <View className="flex-1 rounded-xl border border-[#3E6849] bg-[#1A3B29] px-2.5 py-2">
          <View className="flex-row items-center gap-1.5">
            <GameIcon name="wave" size={15} color="#F7C948" secondaryColor="#8DCB63" />
            <Text className="text-[10px] font-bold text-[#B6D3B0]">INIMIGOS NO CAMPO</Text>
          </View>
          <Text className="mt-0.5 text-base font-black text-[#FFF3C4]">
            {state.waveEnemiesRemaining}
            <Text className="text-[10px] font-normal text-[#B6D3B0]"> ativos</Text>
          </Text>
          <Text className="text-[9px] text-[#8FB08D]">
            {state.waveEnemiesSpawned}/{state.waveEnemiesTotal} gerados
          </Text>
        </View>

        <View className="flex-[1.2] rounded-xl border border-[#3E6849] bg-[#1A3B29] px-2.5 py-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <GameIcon name="health" size={15} color="#65C7F4" secondaryColor="#8DCB63" />
              <Text className="text-[10px] font-bold text-[#B6D3B0]">PLANTAÇÃO</Text>
            </View>
            <Text className="text-[10px] font-black text-[#FFF3C4]">
              {Math.floor(state.plantationHealth)}/{state.maxPlantationHealth}
            </Text>
          </View>
          <View className="mt-1.5 h-2.5 overflow-hidden rounded-full border border-[#44704C] bg-[#0B2419]">
            <View
              className={`h-full rounded-full ${healthPercent <= 30 ? 'bg-[#F07863]' : 'bg-[#8DCB63]'}`}
              style={{ width: `${healthPercent}%` }}
            />
          </View>
          <Text className="mt-0.5 text-[9px] text-[#8FB08D]">Proteja o farol central
</Text>
        </View>
      </View>

      <View className="mt-2 rounded-xl border border-[#3E6849] bg-[#0B2419] px-2.5 py-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] font-bold text-[#DDEFC8]">PROGRESSO DA WAVE</Text>
          <Text className="text-[10px] font-black text-[#F7C948]">
            {state.waveEnemiesSpawned}/{state.waveEnemiesTotal}
          </Text>
        </View>
        <View className="mt-1 h-2 overflow-hidden rounded-full bg-[#244831]">
          <View className="h-full rounded-full bg-[#F7C948]" style={{ width: `${spawnPercent}%` }} />
        </View>
        <Text className="mt-1 text-[9px] text-[#8FB08D]">
          {state.waveEnemiesRemaining === 0 && state.waveEnemiesSpawned < state.waveEnemiesTotal
            ? 'Preparando os próximos inimigos...'
            : state.waveEnemiesRemaining > 0
              ? `${state.waveEnemiesRemaining} inimigo(s) ainda precisam ser derrotados ou escapar`
              : 'Arena limpa — próxima wave em breve'}
        </Text>
      </View>

      <View className="mt-2 rounded-xl border border-[#3E6849] bg-[#0B2419] px-2.5 py-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] font-bold text-[#DDEFC8]">FORMAÇÃO</Text>
          <Text className="text-[9px] font-semibold text-[#8FB08D]">{getFormationDefinition(state.formation).name}</Text>
        </View>
        <View className="mt-1.5 flex-row gap-1.5">
          {(['balanced', 'frontline', 'crossfire'] as const).map((formation) => {
            const selected = state.formation === formation;
            return (
              <Pressable
                key={formation}
                onPress={() => dispatch({ type: 'SET_FORMATION', formation })}
                accessibilityRole="button"
                accessibilityLabel={`Usar formação ${getFormationDefinition(formation).name}`}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.78 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <View
                  className="rounded-lg border px-1.5 py-1.5"
                  style={{
                    borderColor: selected ? '#F7C948' : '#3E6849',
                    backgroundColor: selected ? '#315F40' : '#1A3B29',
                  }}
                >
                  <Text numberOfLines={1} className="text-center text-[8px] font-black text-[#FFF3C4]">
                    {getFormationDefinition(formation).name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-1 text-[9px] text-[#8FB08D]">{getFormationDefinition(state.formation).description}</Text>
      </View>
    </View>
  );
}
