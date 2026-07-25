import React, { useState, useEffect } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useGame } from '@/lib/game/GameContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  duration: number;
}

export function VisualEffects() {
  const { state } = useGame();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Create floating damage text when enemies take damage
  useEffect(() => {
    // This would be triggered by enemy damage events
    // For now, we'll add a simple effect when coins are gained
  }, [state.coins]);

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = `float_${Date.now()}_${Math.random()}`;
    const newText: FloatingText = {
      id,
      x,
      y,
      text,
      color,
      duration: 1500,
    };

    setFloatingTexts((prev) => [...prev, newText]);

    // Remove after duration
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, newText.duration);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth,
        height: screenHeight,
        pointerEvents: 'none',
      }}
    >
      {floatingTexts.map((floatText) => (
        <Animated.Text
          key={floatText.id}
          style={{
            position: 'absolute',
            left: floatText.x,
            top: floatText.y,
            color: floatText.color,
            fontSize: 16,
            fontWeight: 'bold',
            opacity: 1,
          }}
        >
          {floatText.text}
        </Animated.Text>
      ))}
    </View>
  );
}
