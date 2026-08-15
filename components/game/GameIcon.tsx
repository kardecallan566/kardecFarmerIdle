import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
} from 'react-native-svg';

export type GameIconName = 'wave' | 'health' | 'coin' | 'range' | 'damage' | 'speed';

interface GameIconProps {
  name: GameIconName;
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export function GameIcon({
  name,
  size = 18,
  color = '#F7C948',
  secondaryColor = '#234A2B',
}: GameIconProps) {
  const stroke = '#3A2417';
  const strokeWidth = 1.7;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'wave' && (
        <>
          <Path d="M6 20V4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M7 5C10 3 12 7 15 5C17 4 18 4 20 5V12C17 11 16 12 14 12C11 13 9 9 7 11V5Z" fill={color} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M4 20H9" stroke={secondaryColor} strokeWidth={2.2} strokeLinecap="round" />
        </>
      )}
      {name === 'health' && (
        <>
          <Path d="M5 5H13V16C13 18 11.5 19 9 19C6.5 19 5 18 5 16V5Z" fill={secondaryColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M7 5V3H12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M13 8H17L20 11" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M20 11L18 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M15 18C16 16 17 15 18 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M10 20C10 18 9 17 8 16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
      {name === 'coin' && (
        <>
          <Circle cx="12" cy="12" r="8" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="5" fill="none" stroke="#FFF1A8" strokeWidth={1.2} />
          <Path d="M12 7V17M9.5 9.5C10 8.8 11 8.5 12 8.5C13.5 8.5 14.5 9.2 14.5 10.2C14.5 12.6 9.5 11.3 9.5 13.8C9.5 14.9 10.6 15.5 12 15.5C13 15.5 14 15.2 14.5 14.5" stroke={stroke} strokeWidth={1.15} strokeLinecap="round" />
        </>
      )}
      {name === 'range' && (
        <>
          <Circle cx="12" cy="12" r="7" stroke={secondaryColor} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="2.4" fill={color} stroke={stroke} strokeWidth={1.3} />
          <Line x1="12" y1="2.5" x2="12" y2="6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="18" x2="12" y2="21.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="2.5" y1="12" x2="6" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="18" y1="12" x2="21.5" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
      {name === 'damage' && (
        <>
          <Path d="M5 18L16 7" stroke={stroke} strokeWidth={3.2} strokeLinecap="round" />
          <Path d="M5 18L16 7" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
          <Path d="M15 5C18 4 20 5 20 8C18.5 9.5 17 10 15 9" fill={secondaryColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M4 19L7 20" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {name === 'speed' && (
        <>
          <Polygon points="13,2 5,13 11,13 9,22 19,9 13,9" fill={color} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M4 7L6 5M18 5L20 3M3 17H6" stroke={secondaryColor} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
