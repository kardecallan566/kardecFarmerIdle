import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

export type CurrencyIconType = 'campGold' | 'combatSupplies';

const CURRENCY_IMAGES: Record<CurrencyIconType, ImageSourcePropType> = {
  campGold: require('@/assets/images/currency-camp-gold.png'),
  combatSupplies: require('@/assets/images/currency-combat-supplies.png'),
};

const CURRENCY_LABELS: Record<CurrencyIconType, string> = {
  campGold: 'Ícone do Ouro do Acampamento',
  combatSupplies: 'Ícone dos Suprimentos de Combate',
};

interface CurrencyIconProps {
  type: CurrencyIconType;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function CurrencyIcon({ type, size = 20, style }: CurrencyIconProps) {
  return (
    <Image
      source={CURRENCY_IMAGES[type]}
      accessibilityLabel={CURRENCY_LABELS[type]}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
