import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, RadialGradient } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function GradientBackground() {
  return (
    <Svg
      width={screenWidth}
      height={screenHeight / 2}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        {/* Background gradient - earth tones */}
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D4A574" stopOpacity="1" />
          <Stop offset="50%" stopColor="#C4B5A0" stopOpacity="1" />
          <Stop offset="100%" stopColor="#B8A89C" stopOpacity="1" />
        </LinearGradient>

        {/* Radial gradient for plantation glow */}
        <RadialGradient id="plantationGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE066" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </RadialGradient>

        {/* Path gradient */}
        <LinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A89968" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#9A8B6F" stopOpacity="0.4" />
        </LinearGradient>
      </Defs>

      {/* Main background */}
      <Rect width={screenWidth} height={screenHeight / 2} fill="url(#bgGradient)" />
    </Svg>
  );
}
