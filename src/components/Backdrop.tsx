import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme';

// Cream (day) or ink (night) gradient behind the right-hand content.
export function Backdrop() {
  const t = useTheme();
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={t.bg[0]} />
          <Stop offset="1" stopColor={t.bg[1]} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
    </Svg>
  );
}
