import { useIsDayTheme } from '../theme';

// Palettes from typographic_v2_main.svg (day) and typographic_v2_night.svg.
const day = {
  dark: false,
  bg: '#EDEFE7',
  ink: '#111512',
  muted: '#62675F',
  rule: '#BFC4B7',
  blue: '#3048F5',
  lime: '#CFFF38',
  onLime: '#111512',
  orange: '#FF664C',
  block: '#111512',
  paper: '#F6F6ED',
  // Small weather icons on the page background.
  cloud: '#CDD1C4',
  sun: '#FF664C',
  rain: '#3048F5',
};

const night: typeof day = {
  dark: true,
  bg: '#111716',
  ink: '#C5CCB8',
  muted: '#8B978B',
  rule: '#3E4840',
  blue: '#34487F',
  lime: '#A3BA43',
  onLime: '#13201A',
  orange: '#C15C49',
  block: '#171F1C',
  paper: '#D8DFD0',
  cloud: '#C5CCB8',
  sun: '#A3BA43',
  rain: '#A3BA43',
};

export type FNTheme = typeof day;

export const useFN = () => (useIsDayTheme() ? day : night);
