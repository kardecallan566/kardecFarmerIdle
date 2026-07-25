import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Enemy,
  Guard,
  Card,
  GUARD_CONFIGS,
  INITIAL_GAME_CONFIG,
  getWaveConfig,
} from './types';
import {
  getSpawnPoint,
  getPositionOnPath,
  distance,
  generateId,
  generateUpgradeOptions,
} from './utils';

type GameAction =
  | { type: 'INIT_GAME' }
  | { type: 'UPDATE_ENEMIES'; enemies: Enemy[] }
  | { type: 'UPDATE_GUARDS'; guards: Guard[] }
  | { type: 'ADD_GUARD'; guard: Guard }
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
  | { type: 'ENEMY_REACHED_CENTER'; enemyId: string };

const initialState: GameState = {
  wave: 1,
  coins: 200,
  plantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  maxPlantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
  gameActive: true,
  gameLost: false,
  enemies: [],
  guards: [],
  waveEnemiesRemaining: 0,
  waveEnemiesTotal: 0,
  totalEnemiesDefeated: 0,
  totalCoinsEarned: 0,
  upgrades: [],
  selectedCardIndex: null,
  placingMode: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return {
        ...initialState,
        wave: 1,
        coins: 200,
        plantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
        maxPlantationHealth: INITIAL_GAME_CONFIG.initialPlantationHealth,
        gameActive: true,
        gameLost: false,
        enemies: [],
        guards: [],
        upgrades: [],
      };

    case 'UPDATE_ENEMIES':
      return { ...state, enemies: action.enemies };

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
        waveEnemiesTotal: 0,
      };

    case 'GAME_OVER':
      return { ...state, gameLost: true, gameActive: false };

    case 'SELECT_CARD':
      return { ...state, selectedCardIndex: action.cardIndex, placingMode: true };

    case 'DESELECT_CARD':
      return { ...state, selectedCardIndex: null, placingMode: false };

    case 'SET_PLACING_MODE':
      return { ...state, placingMode: action.enabled };

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

  // Initialize game
  useEffect(() => {
    dispatch({ type: 'INIT_GAME' });
  }, []);

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
