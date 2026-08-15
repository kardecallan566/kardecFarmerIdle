import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Enemy,
  Guard,
  Card,
  GUARD_CONFIGS,
  INITIAL_GAME_CONFIG,
  getWaveConfig,
  GuardType,
} from './types';
import {
  getSpawnPoint,
  getPositionOnPath,
  distance,
  generateId,
  generateUpgradeOptions,
} from './utils';

import { CropPlot, SprinklerState } from './types';
import { getPersistentProgress, savePersistentProgress } from './storage';

type GameAction =
  | { type: 'INIT_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_ENEMIES'; enemies: Enemy[] }
  | { type: 'UPDATE_ENEMY'; enemyId: string; patch: Partial<Enemy> }
  | { type: 'ADD_ENEMIES'; enemies: Enemy[] }
  | { type: 'UPDATE_GUARDS'; guards: Guard[] }
  | { type: 'ADD_GUARD'; guard: Guard }
  | { type: 'SPAWN_ENEMY'; enemy: Enemy }
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
  | { type: 'PLANT_CROP'; plotIndex: number; cropType: 'warrior' | 'archer' | 'tank' }
  | { type: 'SELECT_PLOT'; plotIndex: number | null }
  | { type: 'UPDATE_SPRINKLER'; angle: number }
  | { type: 'SET_PLOT_WATERED'; plotIndex: number; watered: boolean }
  | { type: 'RESET_WATERED_FLAGS' }
  | { type: 'LOAD_PROGRESS'; progress: { bankGold: number; unlockedTroops: GuardType[]; troopUpgradeLevels: Record<GuardType, number>; bestWave: number; totalGames: number } }
  | { type: 'CLAIM_RUN_REWARD' }
  | { type: 'UNLOCK_TROOP'; troopType: GuardType; cost: number }
  | { type: 'BUY_TROOP_UPGRADE'; troopType: GuardType; cost: number };

const initialPlots: CropPlot[] = [
  {
    id: 'plot_0',
    index: 0,
    name: 'Quadrante Leste (NE)',
    angleStart: -Math.PI / 4,
    angleEnd: Math.PI / 4,
    cropType: 'warrior',
    cropLevel: 1,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  },
  {
    id: 'plot_1',
    index: 1,
    name: 'Quadrante Sul (SE)',
    angleStart: Math.PI / 4,
    angleEnd: (3 * Math.PI) / 4,
    cropType: null,
    cropLevel: 0,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  },
  {
    id: 'plot_2',
    index: 2,
    name: 'Quadrante Oeste (SO)',
    angleStart: (3 * Math.PI) / 4,
    angleEnd: (5 * Math.PI) / 4,
    cropType: null,
    cropLevel: 0,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  },
  {
    id: 'plot_3',
    index: 3,
    name: 'Quadrante Norte (NO)',
    angleStart: (5 * Math.PI) / 4,
    angleEnd: (7 * Math.PI) / 4,
    cropType: null,
    cropLevel: 0,
    x: 0,
    y: 0,
    isWateredThisCycle: false,
  },
];

const initialState: GameState = {
  wave: 1,
  coins: 250,
  plantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  maxPlantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  gameActive: false,
  gameLost: false,
  enemies: [],
  guards: [],
  plots: initialPlots,
  sprinkler: { angle: 0, rotationSpeed: Math.PI / 2 }, // 1 full turn per 4 seconds
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
  bestWave: 0,
  totalGames: 0,
  progressLoaded: false,
  runRewardClaimed: false,
  lastRunReward: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_PROGRESS':
      return {
        ...state,
        ...action.progress,
        progressLoaded: true,
      };

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

    case 'UNLOCK_TROOP':
      if (state.unlockedTroops.includes(action.troopType) || state.bankGold < action.cost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.cost,
        unlockedTroops: [...state.unlockedTroops, action.troopType],
      };

    case 'BUY_TROOP_UPGRADE':
      if (state.bankGold < action.cost) return state;
      return {
        ...state,
        bankGold: state.bankGold - action.cost,
        troopUpgradeLevels: {
          ...state.troopUpgradeLevels,
          [action.troopType]: state.troopUpgradeLevels[action.troopType] + 1,
        },
      };

    case 'RESET_GAME':
      return {
        ...initialState,
        plots: initialPlots.map((plot) => ({ ...plot, isWateredThisCycle: false })),
      };

    case 'INIT_GAME':
      return {
        ...initialState,
        plots: initialPlots.map(p => ({ ...p, isWateredThisCycle: false })),
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
        sprinkler: { angle: 0, rotationSpeed: Math.PI / 2 },
        bankGold: state.bankGold,
        unlockedTroops: state.unlockedTroops,
        troopUpgradeLevels: state.troopUpgradeLevels,
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
      const coinsGained = INITIAL_GAME_CONFIG.coinGainPerKill;
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.enemyId),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        coins: state.coins + coinsGained,
        totalEnemiesDefeated: state.totalEnemiesDefeated + 1,
        totalCoinsEarned: state.totalCoinsEarned + coinsGained,
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
      };
    }

    case 'SELECT_PLOT':
      return { ...state, selectedPlotIndex: action.plotIndex };

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

    case 'RESET_WATERED_FLAGS': {
      const updatedPlots = state.plots.map((plot) => ({
        ...plot,
        isWateredThisCycle: false,
      }));
      return { ...state, plots: updatedPlots };
    }

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
  }, [dispatch]);

  useEffect(() => {
    if (!state.progressLoaded) return;
    void savePersistentProgress({
      bankGold: state.bankGold,
      unlockedTroops: state.unlockedTroops,
      troopUpgradeLevels: state.troopUpgradeLevels,
      bestWave: state.bestWave,
      totalGames: state.totalGames,
    });
  }, [
    state.progressLoaded,
    state.bankGold,
    state.unlockedTroops,
    state.troopUpgradeLevels,
    state.bestWave,
    state.totalGames,
  ]);

  // Game loop for passive coin generation
  useEffect(() => {
    if (!state.gameActive) return;

    const loopInterval = setInterval(() => {
      const coinsPerFrame = INITIAL_GAME_CONFIG.coinGainPerSecond / 10;
      dispatch({ type: 'ADD_COINS', amount: coinsPerFrame });
    }, 100);

    return () => {
      clearInterval(loopInterval);
    };
  }, [state.gameActive, dispatch]);

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
