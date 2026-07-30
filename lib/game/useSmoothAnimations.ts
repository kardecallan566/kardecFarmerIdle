import { useSharedValue, withTiming, withSpring, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useSmoothScale(initialValue = 1, duration = 300) {
  const scale = useSharedValue(initialValue);

  const animateTo = (value: number, config?: { duration?: number; easing?: any }) => {
    scale.value = withTiming(value, {
      duration: config?.duration ?? duration,
      easing: config?.easing ?? Easing.inOut(Easing.ease),
    });
  };

  return { scale, animateTo };
}

export function useSmoothOpacity(initialValue = 1, duration = 300) {
  const opacity = useSharedValue(initialValue);

  const animateTo = (value: number, config?: { duration?: number; easing?: any }) => {
    opacity.value = withTiming(value, {
      duration: config?.duration ?? duration,
      easing: config?.easing ?? Easing.inOut(Easing.ease),
    });
  };

  return { opacity, animateTo };
}

export function useSmoothPosition(initialX = 0, initialY = 0) {
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);

  const animateTo = (
    targetX: number,
    targetY: number,
    config?: { duration?: number; easing?: any }
  ) => {
    x.value = withTiming(targetX, {
      duration: config?.duration ?? 300,
      easing: config?.easing ?? Easing.inOut(Easing.ease),
    });
    y.value = withTiming(targetY, {
      duration: config?.duration ?? 300,
      easing: config?.easing ?? Easing.inOut(Easing.ease),
    });
  };

  return { x, y, animateTo };
}

export function usePulseAnimation(duration = 1500) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const pulse = () => {
      scale.value = withTiming(1.1, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
      });
      setTimeout(() => {
        scale.value = withTiming(1, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        });
      }, duration / 2);
    };

    const interval = setInterval(pulse, duration);
    pulse(); // Start immediately

    return () => clearInterval(interval);
  }, [duration, scale]);

  return scale;
}

export function useFloatAnimation(range = 10, duration = 2000) {
  const offset = useSharedValue(0);

  useEffect(() => {
    const float = () => {
      offset.value = withTiming(range, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
      });
      setTimeout(() => {
        offset.value = withTiming(-range, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        });
      }, duration / 2);
    };

    const interval = setInterval(float, duration);
    float(); // Start immediately

    return () => clearInterval(interval);
  }, [range, duration, offset]);

  return offset;
}
