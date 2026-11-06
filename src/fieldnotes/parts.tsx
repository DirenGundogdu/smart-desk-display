import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { DesignText as T } from '../components/DesignText';
import { useDesign } from '../design';
import { useNow } from '../hooks';
import { usePager } from '../pager/context';
import { font, useScale } from '../theme';
import { Sky } from '../weather/codes';
import { useWeatherData } from '../weather/WeatherContext';
import { useFN } from './theme';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const pad2 = (n: number) => String(n).padStart(2, '0');

// Absolute box in the 851×393 design space.
export function Box({ x, y, w, h, color, children, style }: { x: number; y: number; w: number; h: number; color?: string; children?: ReactNode; style?: object }) {
  const k = useScale();
  return (
    <View style={[{ position: 'absolute', left: x * k, top: y * k, width: w * k, height: h * k, backgroundColor: color }, style]}>{children}</View>
  );
}

export function HRule({ y, x1 = 20, x2 = 831, color, width = 1 }: { y: number; x1?: number; x2?: number; color: string; width?: number }) {
  return <Box x={x1} y={y - width / 2} w={x2 - x1} h={width} color={color} />;
}

export function VRule({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  return <Box x={x - 0.5} y={y1} w={1} h={y2 - y1} color={color} />;
}

// Wordmark, section, date, city and page dashes. A fling on it changes page (for pages that don't swipe).
export function Header({ section }: { section: string }) {
  const t = useFN();
  const k = useScale();
  const now = useNow(60000);
  const { weather } = useWeatherData();
  const { index, count, goTo } = usePager();
  const { toggle } = useDesign();

  const fling = Gesture.Race(
    Gesture.Fling().direction(Directions.RIGHT).runOnJS(true).onStart(() => goTo(index - 1)),
    Gesture.Fling().direction(Directions.LEFT).runOnJS(true).onStart(() => goTo(index + 1)),
  );

  return (
    <GestureDetector gesture={fling}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 60 * k }}>
        <Box x={20} y={20} w={6} h={25} color={t.blue} />
        {/* Long-press the wordmark to switch art direction. */}
        <Pressable onLongPress={toggle} delayLongPress={700} style={{ position: 'absolute', left: 36 * k, top: 14 * k, width: 120 * k, height: 34 * k }}>
          <T x={3} y={25} size={18} color={t.ink} font={font.black} spacing={-0.7}>
            FIELDNOTES
          </T>
        </Pressable>
        <T x={178} y={39} size={10} color={t.muted} font={font.bold} spacing={1.1}>
          {section}
        </T>
        <T x={573} y={38} size={12} color={t.ink} font={font.bold} spacing={0.3}>
          {DAYS[now.getDay()]}  {pad2(now.getDate())} {MONTHS[now.getMonth()]} {now.getFullYear()}
        </T>
        <T x={729} y={38} size={10} color={t.muted} font={font.bold} spacing={0.6}>
          {(weather?.place.name ?? '').toUpperCase()}
        </T>
        <HRule y={56} color={t.ink} width={1.2} />
        {Array.from({ length: count }, (_, i) => (
          <Pressable key={i} onPress={() => goTo(i)} hitSlop={10} style={{ position: 'absolute', left: (778 + 14 * i) * k, top: 49 * k }}>
            <View style={{ width: (i === index ? 11 : 6) * k, height: 3 * k, backgroundColor: i === index ? t.orange : t.rule }} />
          </Pressable>
        ))}
      </View>
    </GestureDetector>
  );
}

const CLOUD = 'M9 25 C5 25 3 22 3 19 C3 16 5 14 9 14 C11 9 16 8 20 11 C23 12 24 15 24 17 C29 17 31 20 31 23 C31 26 28 28 25 28 L10 28 C9 28 8 27 9 25Z';
const LOW_CLOUD = 'M9 12 C12 6 22 8 24 14 C31 12 34 23 27 24 L8 24 C1 22 3 13 9 12Z';

// Flat sun / cloud marks from the typographic pack, drawn in a 34×34 box.
export function FNIcon({ sky, isDay = true, size, sun, cloud, accent }: { sky: Sky; isDay?: boolean; size: number; sun: string; cloud: string; accent: string }) {
  const orb = isDay ? (
    <Circle cx={13} cy={12} r={8} fill={sun} />
  ) : (
    <Path d="M 15 4.5 A 8 8 0 1 0 21 16 A 6.5 6.5 0 1 1 15 4.5 Z" fill={sun} />
  );
  const wet = sky === 'rain' || sky === 'drizzle' || sky === 'snow' || sky === 'thunder';
  return (
    <Svg width={size} height={size} viewBox="0 0 34 34">
      {(sky === 'clear' || sky === 'partly') && orb}
      {(sky === 'partly' || sky === 'cloudy' || sky === 'fog') && <Path d={CLOUD} fill={cloud} />}
      {sky === 'fog' && (
        <G>
          <Line x1={4} y1={31} x2={26} y2={31} stroke={accent} strokeWidth={2} strokeLinecap="round" />
          <Line x1={10} y1={34} x2={30} y2={34} stroke={accent} strokeWidth={2} strokeLinecap="round" />
        </G>
      )}
      {wet && <Path d={LOW_CLOUD} fill={cloud} />}
      {(sky === 'rain' || sky === 'drizzle') && (
        <G>
          <Line x1={11} y1={27} x2={8} y2={32} stroke={accent} strokeWidth={2} />
          <Line x1={21} y1={27} x2={18} y2={32} stroke={accent} strokeWidth={2} />
        </G>
      )}
      {sky === 'snow' && (
        <G>
          <Circle cx={10} cy={29} r={1.8} fill={accent} />
          <Circle cx={18} cy={31} r={1.8} fill={accent} />
          <Circle cx={25} cy={29} r={1.8} fill={accent} />
        </G>
      )}
      {sky === 'thunder' && <Path d="M17 24 L12 31 L16 31 L13 34 L21 28 L17 28 L19 24 Z" fill={accent} />}
    </Svg>
  );
}

// Full-screen page background.
export function Page({ children }: { children?: ReactNode }) {
  const t = useFN();
  return <View style={{ flex: 1, backgroundColor: t.bg }}>{children}</View>;
}
