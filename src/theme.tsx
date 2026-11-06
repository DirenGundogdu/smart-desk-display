import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { Inter_900Black } from '@expo-google-fonts/inter/900Black';
import { createContext, ReactNode, useContext } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { NOTCH_INSET_LEFT, THEME } from './config';
import { useNow } from './hooks';
import { useWeatherData } from './weather/WeatherContext';

export const FONTS = { Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black };

// Android can't pick weights inside a custom family, so each weight is its own family.
export const font = {
  medium: { fontFamily: 'Inter_500Medium' },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
  heavy: { fontFamily: 'Inter_800ExtraBold' },
  black: { fontFamily: 'Inter_900Black' },
};

// Colours shared by both themes (the clock face and dark bands stay navy).
const shared = {
  face: ['#30324D', '#121D39'],
  band: ['#29344E', '#1A2844', '#262346'],
  bandCell: '#3F5368',
  bandLabel: '#ADB7CC',
  bandAccent: '#FB998D',
  rainOnBand: '#9BE8FA',
  degree: '#E96D82',
  cityDot: '#EC7C82',
  mint: '#BCECE2',
  cream: '#FFF5C7',
  panelText: '#FFF9EA',
  hourHand: '#F8F8F0',
  minuteHand: '#FFE7D4',
  secondHand: '#FA9C9C',
  majorTick: '#FFF1DB',
  minorTick: '#F2C7C8',
  numeral: '#FFF6EE',
  danger: '#D9506A',
  edit: '#4F6FD8',
};

const light = {
  ...shared,
  dark: false,
  bg: ['#FFF6EA', '#F8E9E2'],
  panel: ['#B04782', '#DF697C', '#F3A278'],
  panelCircle: ['#FFCE94', '#FF958C', '#E8669D'],
  ring: '#FFE8DB',
  arc: '#FDE3CF',
  dots: '#FFF1CD',
  title: '#26283B',
  text: '#27273C',
  sub: '#4D4B63',
  accentText: '#B46676',
  label: '#B96B77',
  meta: '#52566A',
  city: '#3E4356',
  orbBack: '#D7F2E3',
  orb: ['#FFDE83', '#FFB574', '#F97981'],
  cloud: '#F7FAF3',
  dayLabel: '#696B7A',
  todayLabel: '#AF5E70',
  min: '#A29BA5',
  rain: '#BE738B',
  rainLow: '#ABACB2',
  divider: '#C7A9AC',
  surface: '#FFFCF8',
  surfaceStrong: '#FFFFFF',
  muted: '#8A8698',
  accent: '#DF697C',
};

type Theme = typeof light;

const dark: Theme = {
  ...shared,
  dark: true,
  bg: ['#1B1D2D', '#242239'],
  panel: ['#552D52', '#77445B', '#99615E'],
  panelCircle: ['#C18C77', '#BC737A', '#80446E'],
  ring: '#AE93AB',
  arc: '#B691A4',
  dots: '#CCB8AC',
  title: '#FAF0EB',
  text: '#F9EEE8',
  sub: '#E2CED5',
  accentText: '#D29BAF',
  label: '#D79AB2',
  meta: '#D6C5D0',
  city: '#DAC7D4',
  orbBack: '#334E55',
  orb: ['#C99A7A', '#C67E76', '#AC6785'],
  cloud: '#EEE3E4',
  dayLabel: '#C6B5C5',
  todayLabel: '#E2ADB4',
  min: '#A694AB',
  rain: '#BE738B',
  rainLow: '#938E9C',
  divider: '#786F86',
  surface: '#29293F',
  surfaceStrong: '#2B2C42',
  muted: '#A49AAE',
  accent: '#E96D82',
};

// Local "YYYY-MM-DDTHH:MM", comparable with Open-Meteo's sunrise/sunset strings.
const localStamp = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function useIsDay() {
  const now = useNow(60000);
  const { weather } = useWeatherData();
  if (THEME !== 'auto') return THEME === 'light';
  const sun = weather?.sun;
  if (sun && sun.rise.slice(0, 10) === localStamp(now).slice(0, 10)) {
    const t = localStamp(now);
    return t >= sun.rise && t < sun.set;
  }
  const h = now.getHours();
  return h >= 7 && h < 19;
}

const ThemeContext = createContext<Theme>(light);
const DayContext = createContext(true);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDay = useIsDay();
  return (
    <DayContext.Provider value={isDay}>
      <ThemeContext.Provider value={isDay ? light : dark}>{children}</ThemeContext.Provider>
    </DayContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
// Day/night for designs that keep their own palettes.
export const useIsDayTheme = () => useContext(DayContext);

// Layout is drawn against the 851×393 dp design; k scales it to the actual screen.
export const DESIGN = { width: 851, height: 393, panel: 330 };
export function useScale() {
  const { width, height } = useWindowDimensions();
  return Math.min((width - NOTCH_INSET) / DESIGN.width, height / DESIGN.height);
}

// Only the phone has the notch; the web preview uses the full width.
export const NOTCH_INSET = Platform.OS === 'android' ? NOTCH_INSET_LEFT : 0;
