import React, { createContext, useEffect, useReducer } from 'react';
import {
  BeaconUpgradeType,
  CropPlot,
  DEFAULT_BESTIARY_PROGRESS,
  DEFAULT_BEACON_UPGRADE_LEVELS,
  GameState,
  getBestiaryReward,
  getBeaconStats,
  getIdleUpgradeCost,
  getOfflineGold,
  getWaveConfig,
  GuardType,
  INITIAL_GAME_CONFIG,
  PersistentProgress,
} from './types';
import { getPersistentProgress, savePersistentProgress } from './storage';

export type GameAction =
  | { type: 'INIT_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_ENEMIES'; enemies: GameState['enemies'] }
  | { type: 'UPDATE_ENEMY'; enemyId: string; patch: Partial<GameState['enemies'][number]> }
  | { type: 'ADD_ENEMIES'; enemies: GameState['enemies'] }
  | { type: 'UPDATE_GUARDS'; guards: GameState['guards'] }
  | { type: 'ADD_GUARD'; guard: GameState['guards'][number] }
  | { type: 'SPAWN_ENEMY'; enemy: GameState['enemies'][number] }
  | { type: 'REMOVE_ENEMY'; enemyId: string }
  | { type: 'DAMAGE_PLANTATION'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SUBTRACT_COINS'; amount: number }
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
  | { type: 'BUY_IDLE_UPGRADE'; cost: number }
  | { type: 'UNLOCK_TROOP'; troopType: GuardType; cost: number }
  | { type: 'BUY_TROOP_UPGRADE'; troopType: GuardType; cost: number }
  | { type: 'BUY_BEACON_UPGRADE'; upgradeType: BeaconUpgradeType; cost: number };

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
  createPlot(0, 'Pátio Leste', -Math.PI / 8, Math.PI / 8, true, 'warrior'),
  createPlot(1, 'Pátio Sudeste', Math.PI / 8, 3 * Math.PI / 8, true),
  createPlot(2, 'Pátio Sul', 3 * Math.PI / 8, 5 * Math.PI / 8, true),
  createPlot(3, 'Pátio Sudoeste', 5 * Math.PI / 8, 7 * Math.PI / 8, true),
  createPlot(4, 'Pátio Oeste', 7 * Math.PI / 8, 9 * Math.PI / 8, false),
  createPlot(5, 'Pátio Noroeste', 9 * Math.PI / 8, 11 * Math.PI / 8, false),
  createPlot(6, 'Pátio Norte', 11 * Math.PI / 8, 13 * Math.PI / 8, false),
  createPlot(7, 'Pátio Nordeste', 13 * Math.PI / 8, 15 * Math.PI / 8, false),
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
  coins: 250,
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
  totalCoinsEarned: 0,
  upgrades: [],
  selectedCardIndex: null,
  placingMode: false,
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
};

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
      const reward = Math.max(
        20,
        Math.floor(state.totalCoinsEarned * 0.45) + state.wave * 20 + state.totalEnemiesDefeated * 2,
      );
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
      const cost = getIdleUpgradeCost(currentLevel);
      if (currentLevel >= 5 || state.bankGold < cost) return state;
      return {
        ...state,
        bankGold: state.bankGold - cost,
        idleUpgradeLevel: currentLevel + 1,
      };
    }

    case 'UNLOCK_TROOP':
      if (state.unlockedTroops.includes(action.troopType) || state.bankGold < action.cost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.cost,
        unlockedTroops: [...state.unlockedTroops, action.troopType],
      };

    case 'BUY_TROOP_UPGRADE':
      if (!state.unlockedTroops.includes(action.troopType) || state.bankGold < action.cost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.cost,
        troopUpgradeLevels: {
          ...state.troopUpgradeLevels,
          [action.troopType]: state.troopUpgradeLevels[action.troopType] + 1,
        },
      };

    case 'BUY_BEACON_UPGRADE': {
      const currentLevel = state.beaconUpgradeLevels[action.upgradeType];
      const maxLevel = action.upgradeType === 'multiSpawn' ? 2 : action.upgradeType === 'extraSlots' ? 4 : 5;
      if (currentLevel >= maxLevel || state.bankGold < action.cost) return state;

      const beaconUpgradeLevels = {
        ...state.beaconUpgradeLevels,
        [action.upgradeType]: currentLevel + 1,
      };
      return {
        ...state,
        bankGold: state.bankGold - action.cost,
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
        coins: 250,
        plantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
        maxPlantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
        gameActive: true,
        gameLost: false,
        enemies: [],
        guards: [],
        upgrades: [],
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
        runRewardClaimed: false,
        lastRunReward: 0,
      };

    case 'UPDATE_ENEMIES': {
      const nextIds = new Set(action.enemies.map((enemy) => enemy.id));
      const concurrentlyAddedEnemies = state.enemies.filter((enemy) => !nextIds.has(enemy.id));
      return {
        ...state,
        enemies: [...action.enemies, ...concurrentlyAddedEnemies],
      };
    }

    case 'UPDATE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.map((enemy) =>
          enemy.id === action.enemyId ? { ...enemy, ...action.patch } : enemy,
        ),
      };

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

    case 'UPDATE_GUARDS':
      return { ...state, guards: action.guards };

    case 'ADD_GUARD':
      return { ...state, guards: [...state.guards, action.guard] };

    case 'REMOVE_ENEMY': {
      const enemy = state.enemies.find((e) => e.id === action.enemyId);
      if (!enemy) return state;
      const previousCount = state.bestiaryDefeated[enemy.kind] ?? 0;
      const nextCount = previousCount + 1;
      const bestiaryReward = getBestiaryReward(enemy.kind, previousCount, nextCount);
      const coinsGained = INITIAL_GAME_CONFIG.coinGainPerKill + bestiaryReward;
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.enemyId),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        coins: state.coins + coinsGained,
        totalEnemiesDefeated: state.totalEnemiesDefeated + 1,
        totalCoinsEarned: state.totalCoinsEarned + coinsGained,
        bestiaryDefeated: {
          ...state.bestiaryDefeated,
          [enemy.kind]: nextCount,
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
      };
    }

    case 'DAMAGE_PLANTATION': {
      const newHealth = Math.max(0, state.plantationHealth - action.amount);
      return {
        ...state,
        plantationHealth: newHealth,
        gameLost: newHealth <= 0 && state.gameActive,
        gameActive: newHealth > 0,
      };
    }

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.amount };

    case 'SUBTRACT_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.amount) };

    case 'NEXT_WAVE':
      return {
        ...state,
        wave: state.wave + 1,
        waveEnemiesRemaining: 0,
        waveEnemiesTotal: getWaveConfig(state.wave + 1).enemyCount,
        waveEnemiesSpawned: 0,
      };

    case 'GAME_OVER':
      return { ...state, gameLost: true, gameActive: false };

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

    case 'APPLY_UPGRADE':
      return { ...state, upgrades: [...state.upgrades] };

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
    if (!state.progressLoaded) return;
    void savePersistentProgress({
      bankGold: state.bankGold,
      unlockedTroops: state.unlockedTroops,
      troopUpgradeLevels: state.troopUpgradeLevels,
      beaconUpgradeLevels: state.beaconUpgradeLevels,
      idleUpgradeLevel: state.idleUpgradeLevel,
      lastOnlineAt: state.lastOnlineAt,
      bestiaryDefeated: state.bestiaryDefeated,
      bestWave: state.bestWave,
      totalGames: state.totalGames,
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
  ]);

  useEffect(() => {
    if (!state.gameActive) return;

    const loopInterval = setInterval(() => {
      const coinsPerFrame = INITIAL_GAME_CONFIG.coinGainPerSecond / 10;
      dispatch({ type: 'ADD_COINS', amount: coinsPerFrame });
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
