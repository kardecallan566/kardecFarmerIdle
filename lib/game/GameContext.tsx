import React, { createContext, useEffect, useReducer } from 'react';
import type { AbilityId } from './abilities';
import { activateAbility, updateAbilityCooldowns } from './abilitySystem';
import {
  BeaconUpgradeType,
  CropPlot,
  CURRENT_SAVE_VERSION,
  DEFAULT_BESTIARY_PROGRESS,
  DEFAULT_BEACON_UPGRADE_LEVELS,
  DEFAULT_RUN_STATS,
  GameState,
  getBestiaryReward,
  getBeaconStats,
  getIdleUpgradeCost,
  getOfflineGold,
  getWaveConfig,
  GuardType,
  INITIAL_GAME_CONFIG,
  PersistentProgress,
  FormationId,
  TechnologyId,
} from './types';
import { getPersistentProgress, savePersistentProgress } from './storage';
import { generateUpgradeOptions } from './utils';
import { DEFAULT_TECHNOLOGY_LEVELS, getTechnologyCost, getTechnologyEffects } from './technology';
import { getAscensionEffects, getAscensionEssenceReward, getAscensionCost, getAscensionRequirement } from './ascension';
import { getRunEventForWave, resolveRunEvent } from './runEvents';

export type GameAction =
  | { type: 'INIT_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_ENEMIES'; enemies: GameState['enemies'] }
  | { type: 'UPDATE_ENEMY'; enemyId: string; patch: Partial<GameState['enemies'][number]> }
  | { type: 'ADD_ENEMIES'; enemies: GameState['enemies'] }
  | { type: 'UPDATE_GUARDS'; guards: GameState['guards'] }
  | { type: 'ACTIVATE_ABILITY'; guardId: string; abilityId: AbilityId }
  | { type: 'UPDATE_ABILITY_COOLDOWNS'; deltaSeconds: number }
  | { type: 'ADD_GUARD'; guard: GameState['guards'][number] }
  | { type: 'SPAWN_ENEMY'; enemy: GameState['enemies'][number] }
  | { type: 'REMOVE_ENEMY'; enemyId: string }
  | { type: 'DAMAGE_PLANTATION'; amount: number }
  | { type: 'ADD_COMBAT_COINS'; amount: number }
  | { type: 'SUBTRACT_COMBAT_COINS'; amount: number }
  | { type: 'NEXT_WAVE' }
  | { type: 'GAME_OVER' }
  | { type: 'SELECT_CARD'; cardIndex: number }
  | { type: 'DESELECT_CARD' }
  | { type: 'SET_PLACING_MODE'; enabled: boolean }
  | { type: 'UPDATE_CARD_COOLDOWN'; cardIndex: number }
  | { type: 'APPLY_UPGRADE'; upgradeIndex: number }
  | { type: 'ENEMY_REACHED_CENTER'; enemyId: string }
  | { type: 'PLANT_CROP'; plotIndex: number; cropType: GuardType }
  | { type: 'SELECT_PLOT'; plotIndex: number | null }
  | { type: 'UPDATE_SPRINKLER'; angle: number }
  | { type: 'SET_PLOT_WATERED'; plotIndex: number; watered: boolean }
  | { type: 'RESET_WATERED_FLAGS' }
  | { type: 'LOAD_PROGRESS'; progress: PersistentProgress }
  | { type: 'CLAIM_RUN_REWARD' }
  | { type: 'CLAIM_IDLE_GOLD' }
  | { type: 'BUY_IDLE_UPGRADE'; goldCost: number }
  | { type: 'UNLOCK_TROOP'; troopType: GuardType; goldCost: number }
  | { type: 'BUY_TROOP_UPGRADE'; troopType: GuardType; goldCost: number }
  | { type: 'BUY_BEACON_UPGRADE'; upgradeType: BeaconUpgradeType; goldCost: number }
  | { type: 'SET_FORMATION'; formation: FormationId }
  | { type: 'BUY_TECHNOLOGY'; technologyId: TechnologyId }
  | { type: 'ASCEND' }
  | { type: 'CHOOSE_RUN_EVENT'; choiceId: string };

function createPlot(
  index: number,
  name: string,
  angleStart: number,
  angleEnd: number,
  unlocked: boolean,
  cropType: GuardType | null = null,
): CropPlot {
  return {
    id: `plot_${index}`,
    index,
    name,
    angleStart,
    angleEnd,
    cropType,
    cropLevel: cropType ? 1 : 0,
    unlocked,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  };
}

const initialPlots: CropPlot[] = [
  createPlot(0, 'Quartel Norte', -5 * Math.PI / 8, -3 * Math.PI / 8, true, 'warrior'),
  createPlot(1, 'Quartel Nordeste', -3 * Math.PI / 8, -Math.PI / 8, true),
  createPlot(2, 'Quartel Leste', -Math.PI / 8, Math.PI / 8, true),
  createPlot(3, 'Quartel Sudeste', Math.PI / 8, 3 * Math.PI / 8, true),
  createPlot(4, 'Quartel Sul', 3 * Math.PI / 8, 5 * Math.PI / 8, false),
  createPlot(5, 'Quartel Sudoeste', 5 * Math.PI / 8, 7 * Math.PI / 8, false),
  createPlot(6, 'Quartel Oeste', 7 * Math.PI / 8, 9 * Math.PI / 8, false),
  createPlot(7, 'Quartel Noroeste', 9 * Math.PI / 8, 11 * Math.PI / 8, false),
];

function createRunPlots(beaconUpgradeLevels = DEFAULT_BEACON_UPGRADE_LEVELS): CropPlot[] {
  const unlockedPlotCount = getBeaconStats(beaconUpgradeLevels).unlockedPlotCount;
  return initialPlots.map((plot) => ({
    ...plot,
    unlocked: plot.index < unlockedPlotCount,
    cropType: plot.index === 0 ? 'warrior' : null,
    cropLevel: plot.index === 0 ? 1 : 0,
    isWateredThisCycle: false,
  }));
}

const initialState: GameState = {
  wave: 1,
  combatCoins: 250,
  plantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  maxPlantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  gameActive: false,
  gameLost: false,
  enemies: [],
  guards: [],
  plots: createRunPlots(),
  sprinkler: { angle: 0, rotationSpeed: getBeaconStats().rotationSpeed },
  selectedPlotIndex: null,
  waveEnemiesRemaining: 0,
  waveEnemiesTotal: getWaveConfig(1).enemyCount,
  waveEnemiesSpawned: 0,
  totalEnemiesDefeated: 0,
  totalCombatCoinsEarned: 0,
  runStats: { ...DEFAULT_RUN_STATS, enemiesDefeatedByKind: {} },
  upgrades: [],
  pendingWaveRewards: [],
  selectedCardIndex: null,
  placingMode: false,
  formation: 'balanced',
  bankGold: 0,
  unlockedTroops: ['warrior'],
  troopUpgradeLevels: { warrior: 0, archer: 0, tank: 0 },
  beaconUpgradeLevels: { ...DEFAULT_BEACON_UPGRADE_LEVELS },
  idleUpgradeLevel: 0,
  idleGoldAvailable: 0,
  lastOnlineAt: Date.now(),
  bestiaryDefeated: { ...DEFAULT_BESTIARY_PROGRESS },
  bestWave: 0,
  totalGames: 0,
  progressLoaded: false,
  runRewardClaimed: false,
  lastRunReward: 0,
  technologyLevels: { ...DEFAULT_TECHNOLOGY_LEVELS },
  ascensionLevel: 0,
  forestEssence: 0,
  activeRunEvent: null,
};

function getCombatCoinMultiplier(
  upgrades: GameState['upgrades'],
  technologyLevels: GameState['technologyLevels'],
  ascensionLevel: number,
): number {
  const technologyEffects = getTechnologyEffects(technologyLevels);
  const ascensionEffects = getAscensionEffects(ascensionLevel);
  return upgrades.reduce(
    (multiplier, upgrade) => upgrade.type === 'combatCoins' ? multiplier * (1 + upgrade.value) : multiplier,
    technologyEffects.combatCoinMultiplier * ascensionEffects.combatCoinMultiplier,
  );
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_PROGRESS': {
      const beaconUpgradeLevels = action.progress.beaconUpgradeLevels ?? DEFAULT_BEACON_UPGRADE_LEVELS;
      const bestiaryDefeated = action.progress.bestiaryDefeated ?? DEFAULT_BESTIARY_PROGRESS;
      return {
        ...state,
        ...action.progress,
        beaconUpgradeLevels,
        bestiaryDefeated,
        technologyLevels: action.progress.technologyLevels ?? { ...DEFAULT_TECHNOLOGY_LEVELS },
        ascensionLevel: action.progress.ascensionLevel ?? 0,
        forestEssence: action.progress.forestEssence ?? 0,
        idleGoldAvailable: getOfflineGold(
          action.progress.lastOnlineAt,
          Date.now(),
          action.progress.idleUpgradeLevel,
        ),
        plots: createRunPlots(beaconUpgradeLevels),
        sprinkler: {
          ...state.sprinkler,
          rotationSpeed: getBeaconStats(beaconUpgradeLevels).rotationSpeed,
        },
        progressLoaded: true,
      };
    }

    case 'CLAIM_RUN_REWARD': {
      if (!state.gameLost || state.runRewardClaimed) return state;
      // Ouro do Acampamento nasce do desempenho da run, nunca do saldo de suprimentos.
      const bossBonus = getWaveConfig(state.wave).isBossWave ? 120 : 0;
      const reward = Math.max(20, state.wave * 30 + state.totalEnemiesDefeated * 3 + bossBonus);
      return {
        ...state,
        bankGold: state.bankGold + reward,
        bestWave: Math.max(state.bestWave, state.wave),
        totalGames: state.totalGames + 1,
        runRewardClaimed: true,
        lastRunReward: reward,
      };
    }

    case 'CLAIM_IDLE_GOLD':
      if (state.idleGoldAvailable <= 0) {
        return { ...state, lastOnlineAt: Date.now() };
      }
      return {
        ...state,
        bankGold: state.bankGold + state.idleGoldAvailable,
        idleGoldAvailable: 0,
        lastOnlineAt: Date.now(),
      };

    case 'BUY_IDLE_UPGRADE': {
      const currentLevel = state.idleUpgradeLevel;
      const goldCost = getIdleUpgradeCost(currentLevel);
      if (currentLevel >= 5 || state.bankGold < goldCost) return state;
      return {
        ...state,
        bankGold: state.bankGold - goldCost,
        idleUpgradeLevel: currentLevel + 1,
      };
    }

    case 'UNLOCK_TROOP':
      if (state.unlockedTroops.includes(action.troopType) || state.bankGold < action.goldCost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.goldCost,
        unlockedTroops: [...state.unlockedTroops, action.troopType],
      };

    case 'BUY_TROOP_UPGRADE':
      if (!state.unlockedTroops.includes(action.troopType) || state.bankGold < action.goldCost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.goldCost,
        troopUpgradeLevels: {
          ...state.troopUpgradeLevels,
          [action.troopType]: state.troopUpgradeLevels[action.troopType] + 1,
        },
      };

    case 'BUY_TECHNOLOGY': {
      const currentLevel = state.technologyLevels[action.technologyId];
      const technologyCost = getTechnologyCost(action.technologyId, currentLevel);
      if (currentLevel >= 5 || state.bankGold < technologyCost) return state;
      return {
        ...state,
        bankGold: state.bankGold - technologyCost,
        technologyLevels: {
          ...state.technologyLevels,
          [action.technologyId]: currentLevel + 1,
        },
      };
    }

    case 'ASCEND': {
      const cost = getAscensionCost(state.ascensionLevel);
      const requirement = getAscensionRequirement(state.ascensionLevel);
      if (state.forestEssence < cost || state.bestWave < requirement) return state;
      return {
        ...state,
        forestEssence: state.forestEssence - cost,
        ascensionLevel: state.ascensionLevel + 1,
      };
    }

    case 'BUY_BEACON_UPGRADE': {
      const currentLevel = state.beaconUpgradeLevels[action.upgradeType];
      const maxLevel = action.upgradeType === 'multiSpawn' ? 2 : action.upgradeType === 'extraSlots' ? 4 : 5;
      if (currentLevel >= maxLevel || state.bankGold < action.goldCost) return state;

      const beaconUpgradeLevels = {
        ...state.beaconUpgradeLevels,
        [action.upgradeType]: currentLevel + 1,
      };
      return {
        ...state,
        bankGold: state.bankGold - action.goldCost,
        beaconUpgradeLevels,
        plots: createRunPlots(beaconUpgradeLevels),
        sprinkler: {
          ...state.sprinkler,
          rotationSpeed: getBeaconStats(beaconUpgradeLevels).rotationSpeed,
        },
      };
    }

    case 'RESET_GAME':
      return {
        ...initialState,
        plots: createRunPlots(state.beaconUpgradeLevels),
        beaconUpgradeLevels: state.beaconUpgradeLevels,
        bankGold: state.bankGold,
        unlockedTroops: state.unlockedTroops,
        troopUpgradeLevels: state.troopUpgradeLevels,
        idleUpgradeLevel: state.idleUpgradeLevel,
        idleGoldAvailable: state.idleGoldAvailable,
        lastOnlineAt: state.lastOnlineAt,
        bestiaryDefeated: state.bestiaryDefeated,
        bestWave: state.bestWave,
        totalGames: state.totalGames,
        progressLoaded: state.progressLoaded,
        formation: state.formation,
        technologyLevels: state.technologyLevels,
        ascensionLevel: state.ascensionLevel,
        forestEssence: state.forestEssence,
        activeRunEvent: null,
        runStats: { ...DEFAULT_RUN_STATS, enemiesDefeatedByKind: {} },
        sprinkler: {
          angle: 0,
          rotationSpeed: getBeaconStats(state.beaconUpgradeLevels).rotationSpeed,
        },
      };

    case 'INIT_GAME':
      return {
        ...initialState,
        plots: createRunPlots(state.beaconUpgradeLevels),
        wave: 1,
        combatCoins: 250,
        plantationHealth: Math.round(INITIAL_GAME_CONFIG.initialPlantationHealth * getAscensionEffects(state.ascensionLevel).plantationHealthMultiplier),
        maxPlantationHealth: Math.round(INITIAL_GAME_CONFIG.initialPlantationHealth * getAscensionEffects(state.ascensionLevel).plantationHealthMultiplier),
        gameActive: true,
        gameLost: false,
        enemies: [],
        guards: [],
        upgrades: [],
        pendingWaveRewards: [],
        waveEnemiesRemaining: 0,
        waveEnemiesTotal: getWaveConfig(1).enemyCount,
        waveEnemiesSpawned: 0,
        sprinkler: {
          angle: 0,
          rotationSpeed: getBeaconStats(state.beaconUpgradeLevels).rotationSpeed,
        },
        bankGold: state.bankGold,
        unlockedTroops: state.unlockedTroops,
        troopUpgradeLevels: state.troopUpgradeLevels,
        beaconUpgradeLevels: state.beaconUpgradeLevels,
        idleUpgradeLevel: state.idleUpgradeLevel,
        idleGoldAvailable: state.idleGoldAvailable,
        lastOnlineAt: state.lastOnlineAt,
        bestiaryDefeated: state.bestiaryDefeated,
        bestWave: state.bestWave,
        totalGames: state.totalGames,
        progressLoaded: state.progressLoaded,
        formation: state.formation,
        runRewardClaimed: false,
        lastRunReward: 0,
        technologyLevels: state.technologyLevels,
        ascensionLevel: state.ascensionLevel,
        forestEssence: state.forestEssence,
        activeRunEvent: null,
        runStats: { ...DEFAULT_RUN_STATS, enemiesDefeatedByKind: {} },
      };

    case 'UPDATE_ENEMIES': {
      const nextIds = new Set(action.enemies.map((enemy) => enemy.id));
      const concurrentlyAddedEnemies = state.enemies.filter((enemy) => !nextIds.has(enemy.id));
      return {
        ...state,
        enemies: [...action.enemies, ...concurrentlyAddedEnemies],
      };
    }

    case 'UPDATE_ENEMY': {
      const previousEnemy = state.enemies.find((enemy) => enemy.id === action.enemyId);
      if (!previousEnemy) return state;
      const nextEnemy = { ...previousEnemy, ...action.patch };
      const damageDealt = Math.max(0, previousEnemy.health - nextEnemy.health);
      return {
        ...state,
        enemies: state.enemies.map((enemy) => enemy.id === action.enemyId ? nextEnemy : enemy),
        runStats: damageDealt > 0
          ? { ...state.runStats, damageDealt: state.runStats.damageDealt + damageDealt }
          : state.runStats,
      };
    }

    case 'SPAWN_ENEMY':
      return {
        ...state,
        enemies: [...state.enemies, action.enemy],
        waveEnemiesRemaining: state.waveEnemiesRemaining + 1,
        waveEnemiesSpawned: state.waveEnemiesSpawned + 1,
      };

    case 'ADD_ENEMIES':
      return {
        ...state,
        enemies: [...state.enemies, ...action.enemies],
        waveEnemiesRemaining: state.waveEnemiesRemaining + action.enemies.length,
        waveEnemiesSpawned: state.waveEnemiesSpawned + action.enemies.length,
        waveEnemiesTotal: state.waveEnemiesTotal + action.enemies.length,
      };

    case 'UPDATE_GUARDS': {
      const nextIds = new Set(action.guards.map((guard) => guard.id));
      const guardsLost = state.guards.filter((guard) => !nextIds.has(guard.id)).length;
      const damageTaken = state.guards.reduce((total, guard) => {
        const nextGuard = action.guards.find((candidate) => candidate.id === guard.id);
        return total + Math.max(0, guard.health - (nextGuard?.health ?? 0));
      }, 0);
      return {
        ...state,
        guards: action.guards,
        runStats: {
          ...state.runStats,
          guardsLost: state.runStats.guardsLost + guardsLost,
          damageTaken: state.runStats.damageTaken + damageTaken,
        },
      };
    }

    case 'ACTIVATE_ABILITY': {
      const guard = state.guards.find((candidate) => candidate.id === action.guardId);
      if (!guard) return state;

      const activation = activateAbility(guard, action.abilityId);
      if (!activation) return state;

      return {
        ...state,
        guards: state.guards.map((candidate) =>
          candidate.id === action.guardId ? activation.guard : candidate,
        ),
        runStats: { ...state.runStats, abilitiesActivated: state.runStats.abilitiesActivated + 1 },
      };
    }

    case 'UPDATE_ABILITY_COOLDOWNS': {
      if (!Number.isFinite(action.deltaSeconds) || action.deltaSeconds <= 0) return state;
      return {
        ...state,
        guards: state.guards.map((guard) => updateAbilityCooldowns(guard, action.deltaSeconds)),
      };
    }

    case 'ADD_GUARD': {
      const guards = [...state.guards, action.guard];
      return {
        ...state,
        guards,
        runStats: {
          ...state.runStats,
          guardsSpawned: state.runStats.guardsSpawned + 1,
          maxGuards: Math.max(state.runStats.maxGuards, guards.length),
        },
      };
    }

    case 'REMOVE_ENEMY': {
      const enemy = state.enemies.find((e) => e.id === action.enemyId);
      if (!enemy) return state;
      const previousCount = state.bestiaryDefeated[enemy.kind] ?? 0;
      const nextCount = previousCount + 1;
      const bestiaryReward = getBestiaryReward(enemy.kind, previousCount, nextCount);
      const combatCoinsGained = Math.round(
        (INITIAL_GAME_CONFIG.combatCoinsPerKill + bestiaryReward) * getCombatCoinMultiplier(state.upgrades, state.technologyLevels, state.ascensionLevel),
      );
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.enemyId),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        combatCoins: state.combatCoins + combatCoinsGained,
        totalEnemiesDefeated: state.totalEnemiesDefeated + 1,
        totalCombatCoinsEarned: state.totalCombatCoinsEarned + combatCoinsGained,
        bestiaryDefeated: {
          ...state.bestiaryDefeated,
          [enemy.kind]: nextCount,
        },
        runStats: {
          ...state.runStats,
          enemiesDefeatedByKind: {
            ...state.runStats.enemiesDefeatedByKind,
            [enemy.kind]: (state.runStats.enemiesDefeatedByKind[enemy.kind] ?? 0) + 1,
          },
        },
      };
    }

    case 'ENEMY_REACHED_CENTER': {
      const enemyExists = state.enemies.some((enemy) => enemy.id === action.enemyId);
      if (!enemyExists) return state;
      return {
        ...state,
        enemies: state.enemies.filter((enemy) => enemy.id !== action.enemyId),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        runStats: { ...state.runStats, enemiesEscaped: state.runStats.enemiesEscaped + 1 },
      };
    }

    case 'DAMAGE_PLANTATION': {
      const newHealth = Math.max(0, state.plantationHealth - action.amount);
      return {
        ...state,
        plantationHealth: newHealth,
        gameLost: newHealth <= 0 && state.gameActive,
        gameActive: newHealth > 0,
        runStats: { ...state.runStats, damageTaken: state.runStats.damageTaken + Math.max(0, action.amount) },
      };
    }

    case 'ADD_COMBAT_COINS':
      return { ...state, combatCoins: state.combatCoins + action.amount };

    case 'SUBTRACT_COMBAT_COINS':
      return {
        ...state,
        combatCoins: Math.max(0, state.combatCoins - action.amount),
        runStats: { ...state.runStats, suppliesSpent: state.runStats.suppliesSpent + Math.max(0, action.amount) },
      };

    case 'NEXT_WAVE': {
      const nextWave = state.wave + 1;
      const clearedBossWave = getWaveConfig(state.wave).isBossWave;
      const activeRunEvent = clearedBossWave ? getRunEventForWave(nextWave) : null;
      const essenceReward = clearedBossWave ? getAscensionEssenceReward(state.wave) : 0;
      return {
        ...state,
        wave: nextWave,
        gameActive: !clearedBossWave,
        activeRunEvent,
        waveEnemiesRemaining: 0,
        waveEnemiesTotal: getWaveConfig(nextWave).enemyCount,
        waveEnemiesSpawned: 0,
        pendingWaveRewards: clearedBossWave ? generateUpgradeOptions(3) : [],
        forestEssence: state.forestEssence + essenceReward,
        runStats: {
          ...state.runStats,
          wavesCleared: state.runStats.wavesCleared + 1,
          bossesDefeated: state.runStats.bossesDefeated + (clearedBossWave ? 1 : 0),
        },
      };
    }

    case 'GAME_OVER':
      return { ...state, gameLost: true, gameActive: false };

    case 'SET_FORMATION':
      return { ...state, formation: action.formation };

    case 'SELECT_CARD':
      return { ...state, selectedCardIndex: action.cardIndex, placingMode: true };

    case 'DESELECT_CARD':
      return { ...state, selectedCardIndex: null, placingMode: false };

    case 'SET_PLACING_MODE':
      return { ...state, placingMode: action.enabled };

    case 'PLANT_CROP': {
      const selectedPlot = state.plots.find((plot) => plot.index === action.plotIndex);
      if (!selectedPlot?.unlocked) return state;
      const updatedPlots = state.plots.map((plot) => {
        if (plot.index === action.plotIndex) {
          return {
            ...plot,
            cropType: action.cropType,
            cropLevel: 1,
            isWateredThisCycle: false,
          };
        }
        return plot;
      });
      return {
        ...state,
        plots: updatedPlots,
        selectedPlotIndex: null,
        selectedCardIndex: null,
        placingMode: false,
      };
    }

    case 'SELECT_PLOT':
      return {
        ...state,
        selectedPlotIndex: state.plots.some((plot) => plot.index === action.plotIndex && plot.unlocked)
          ? action.plotIndex
          : null,
      };

    case 'UPDATE_SPRINKLER':
      return {
        ...state,
        sprinkler: { ...state.sprinkler, angle: action.angle },
      };

    case 'SET_PLOT_WATERED': {
      const updatedPlots = state.plots.map((plot) => {
        if (plot.index === action.plotIndex) {
          return { ...plot, isWateredThisCycle: action.watered };
        }
        return plot;
      });
      return { ...state, plots: updatedPlots };
    }

    case 'RESET_WATERED_FLAGS':
      return {
        ...state,
        plots: state.plots.map((plot) => ({ ...plot, isWateredThisCycle: false })),
      };

    case 'APPLY_UPGRADE': {
      const selectedUpgrade = state.pendingWaveRewards[action.upgradeIndex];
      if (!selectedUpgrade) return state;
      return {
        ...state,
        upgrades: [...state.upgrades, selectedUpgrade],
        pendingWaveRewards: [],
        gameActive: state.activeRunEvent === null,
        runStats: { ...state.runStats, relicsChosen: state.runStats.relicsChosen + 1 },
      };
    }

    case 'CHOOSE_RUN_EVENT': {
      if (!state.activeRunEvent) return state;
      const outcome = resolveRunEvent(state.activeRunEvent.id, action.choiceId);
      return {
        ...state,
        combatCoins: Math.max(0, state.combatCoins + outcome.combatCoinsDelta),
        plantationHealth: Math.min(
          state.maxPlantationHealth,
          Math.max(1, state.plantationHealth + outcome.plantationHealthDelta),
        ),
        upgrades: outcome.upgrade ? [...state.upgrades, outcome.upgrade] : state.upgrades,
        activeRunEvent: null,
        gameActive: true,
        runStats: { ...state.runStats, eventsChosen: state.runStats.eventsChosen + 1 },
      };
    }

    default:
      return state;
  }
}

export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    let cancelled = false;
    getPersistentProgress().then((progress) => {
      if (!cancelled) dispatch({ type: 'LOAD_PROGRESS', progress });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    const abilityClock = setInterval(() => {
      dispatch({ type: 'UPDATE_ABILITY_COOLDOWNS', deltaSeconds: 0.1 });
    }, 100);

    return () => clearInterval(abilityClock);
  }, [state.gameActive, state.gameLost, dispatch]);

  useEffect(() => {
    if (!state.progressLoaded) return;
    void savePersistentProgress({
      saveVersion: CURRENT_SAVE_VERSION,
      bankGold: state.bankGold,
      unlockedTroops: state.unlockedTroops,
      troopUpgradeLevels: state.troopUpgradeLevels,
      beaconUpgradeLevels: state.beaconUpgradeLevels,
      idleUpgradeLevel: state.idleUpgradeLevel,
      lastOnlineAt: state.lastOnlineAt,
      bestiaryDefeated: state.bestiaryDefeated,
      bestWave: state.bestWave,
      totalGames: state.totalGames,
      technologyLevels: state.technologyLevels,
      ascensionLevel: state.ascensionLevel,
      forestEssence: state.forestEssence,
    });
  }, [
    state.progressLoaded,
    state.bankGold,
    state.unlockedTroops,
    state.troopUpgradeLevels,
    state.beaconUpgradeLevels,
    state.idleUpgradeLevel,
    state.lastOnlineAt,
    state.bestiaryDefeated,
    state.bestWave,
    state.totalGames,
    state.technologyLevels,
    state.ascensionLevel,
    state.forestEssence,
  ]);

  useEffect(() => {
    if (!state.gameActive) return;

    const loopInterval = setInterval(() => {
      const combatCoinsPerTick = (INITIAL_GAME_CONFIG.combatCoinsPerSecond / 10) * getCombatCoinMultiplier(state.upgrades, state.technologyLevels, state.ascensionLevel);
      dispatch({ type: 'ADD_COMBAT_COINS', amount: combatCoinsPerTick });
    }, 100);

    return () => clearInterval(loopInterval);
  }, [state.gameActive]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
