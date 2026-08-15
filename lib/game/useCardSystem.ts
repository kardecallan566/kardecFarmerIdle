import { useEffect, useRef } from 'react';
import { useGame } from './GameContext';
import { GUARD_CONFIGS } from './types';

interface CardState {
  cardIndex: number;
  cooldown: number;
  maxCooldown: number;
}

export function useCardSystem() {
  const { state, dispatch } = useGame();
  const cardCooldownsRef = useRef<CardState[]>([
    { cardIndex: 0, cooldown: 0, maxCooldown: 5 },
    { cardIndex: 1, cooldown: 0, maxCooldown: 5 },
    { cardIndex: 2, cooldown: 0, maxCooldown: 5 },
  ]);

  // Update card cooldowns
  useEffect(() => {
    if (!state.gameActive || state.gameLost) return;

    const cooldownInterval = setInterval(() => {
      cardCooldownsRef.current = cardCooldownsRef.current.map((card) => ({
        ...card,
        cooldown: Math.max(0, card.cooldown - 0.1),
      }));
    }, 100);

    return () => clearInterval(cooldownInterval);
  }, [state.gameActive, state.gameLost]);

  // Handle card selection and guard placement
  const selectCard = (cardIndex: number) => {
    const card = cardCooldownsRef.current[cardIndex];
    if (card.cooldown > 0) return; // Card on cooldown

    const guardTypes = ['warrior', 'archer', 'tank'] as const;
    const guardType = guardTypes[cardIndex];
    const guardConfig = GUARD_CONFIGS[guardType];
    if (!state.unlockedTroops.includes(guardType)) return;

    // Check if player has enough coins
    if (state.coins < guardConfig.cost) return;

    // Deduct coins
    dispatch({ type: 'SUBTRACT_COINS', amount: guardConfig.cost });

    // Start card cooldown
    cardCooldownsRef.current[cardIndex].cooldown = card.maxCooldown;

    // Select card for placement
    dispatch({ type: 'SELECT_CARD', cardIndex });
  };

  const deselectCard = () => {
    dispatch({ type: 'DESELECT_CARD' });
  };

  const getCardCooldown = (cardIndex: number): number => {
    return cardCooldownsRef.current[cardIndex]?.cooldown || 0;
  };

  const getCardMaxCooldown = (cardIndex: number): number => {
    return cardCooldownsRef.current[cardIndex]?.maxCooldown || 5;
  };

  const isCardAvailable = (cardIndex: number): boolean => {
    return getCardCooldown(cardIndex) <= 0;
  };

  const isTroopUnlocked = (cardIndex: number): boolean => {
    const guardTypes = ['warrior', 'archer', 'tank'] as const;
    return state.unlockedTroops.includes(guardTypes[cardIndex]);
  };

  return {
    selectCard,
    deselectCard,
    getCardCooldown,
    getCardMaxCooldown,
    isCardAvailable,
    isTroopUnlocked,
    cardCooldowns: cardCooldownsRef.current,
  };
}
