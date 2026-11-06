import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '../theme';
import { Sky } from './codes';

// Shapes come from the art direction SVGs (studio_colorblock*.svg).
const CLOUD =
  'M 11 33 C 5 33 3 28 5 23 C 6.5 19 11 17.5 15 19 C 17 12 23 10 29 13 C 33 15 35 18 35 22 C 40 21 45 25 45 30 C 45 35 41 38 36 38 L 13 38 C 12 38 11 36 11 33 Z';
const CLOUD_EDGE = 'M 11 33 C 5 33 3 28 5 23 C 6.5 19 11 17.5 15 19 C 17 12 23 10 29 13 C 33 15 35 18 35 22 C 40 21 45 25 45 30 C 45 35 41 38 36 38';
const BIG_CLOUD =
  'M 654 176 C 645 168 651 155 661 154 C 667 143 681 141 690 147 C 695 131 712 125 725 134 C 733 138 738 145 738 154 C 750 150 766 161 762 173 C 760 183 750 185 736 185 L 667 185 C 661 185 657 183 654 176 Z';
const BIG_CLOUD_LINE = 'M 668 178 Q 675 164 687 173 Q 702 159 717 174 Q 737 164 751 176';

type Palette = { sun: string; moon: string; cloud: string; cloudStroke?: string; rain: string };

// Light shapes on the navy hourly band.
export const ON_BAND: Palette = { sun: '#F9C06F', moon: '#F6E2B3', cloud: '#F9F5F3', rain: '#99DBFF' };
// Navy outlined shapes for the five-day row.
export const OUTLINED: Palette = { sun: '#FF5B91', moon: '#FF8FB0', cloud: '#172C3E', cloudStroke: '#49EBE3', rain: '#3DD8FF' };

function Sun({ color }: { color: string }) {
  return (
    <G>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <Line
            key={i}
            x1={17 + 13 * Math.sin(a)}
            y1={17 - 13 * Math.cos(a)}
            x2={17 + 17 * Math.sin(a)}
            y2={17 - 17 * Math.cos(a)}
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
      <Circle cx={17} cy={17} r={9.3} fill={color} />
    </G>
  );
}

function Moon({ color }: { color: string }) {
  return <Path d="M 20 5 A 12 12 0 1 0 30 22 A 9.5 9.5 0 1 1 20 5 Z" fill={color} />;
}

function Precip({ sky, p }: { sky: Sky; p: Palette }) {
  if (sky === 'rain' || sky === 'drizzle') {
    const xs = sky === 'rain' ? [16, 28, 40] : [20, 34];
    return (
      <G>
        {xs.map((x) => (
          <Line key={x} x1={x} y1={43} x2={x - 3} y2={48} stroke={p.rain} strokeWidth={2} strokeLinecap="round" />
        ))}
      </G>
    );
  }
  if (sky === 'snow') {
    return (
      <G>
        {[14, 26, 38].map((x, i) => (
          <Circle key={x} cx={x} cy={i % 2 ? 48 : 44} r={2.2} fill={p.rain} />
        ))}
      </G>
    );
  }
  if (sky === 'fog') {
    return (
      <G>
        <Line x1={8} y1={43} x2={40} y2={43} stroke={p.rain} strokeWidth={2} strokeLinecap="round" />
        <Line x1={14} y1={48} x2={44} y2={48} stroke={p.rain} strokeWidth={2} strokeLinecap="round" />
      </G>
    );
  }
  if (sky === 'thunder') return <Path d="M 27 38 L 20 47 L 26 47 L 22 54 L 32 44 L 26 44 L 30 38 Z" fill="#F9C06F" />;
  return null;
}

export function WeatherIcon({ sky, isDay = true, size, palette }: { sky: Sky; isDay?: boolean; size: number; palette: Palette }) {
  const p = palette;
  const Orb = isDay ? <Sun color={p.sun} /> : <Moon color={p.moon} />;
  return (
    <Svg width={size} height={(size * 54) / 46} viewBox="0 0 46 54">
      {sky === 'clear' ? (
        <G transform="translate(6 8)">{Orb}</G>
      ) : (
        <>
          {sky === 'partly' && Orb}
          <Path d={CLOUD} fill={p.cloud} stroke={p.cloudStroke ?? 'none'} strokeWidth={1.3} />
          {!p.cloudStroke && <Path d={CLOUD_EDGE} fill="none" stroke="#fff" strokeWidth={0.5} opacity={0.4} />}
          <Precip sky={sky} p={p} />
        </>
      )}
    </Svg>
  );
}

// The large sun/moon + cloud illustration beside the temperature.
export function WeatherArt({ sky, isDay, size }: { sky: Sky; isDay: boolean; size: number }) {
  const t = useTheme();
  const showCloud = sky !== 'clear';
  const bigP: Palette = { sun: '', moon: '', cloud: t.cloud, rain: '#5DB7E8' };
  return (
    <Svg width={size} height={size} viewBox="0 0 130 130">
      <Defs>
        <LinearGradient id="orb" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={t.orb[0]} />
          <Stop offset="0.5" stopColor={t.orb[1]} />
          <Stop offset="1" stopColor={t.orb[2]} />
        </LinearGradient>
        <ClipPath id="orbClip">
          <Circle cx={67} cy={59} r={53} />
        </ClipPath>
      </Defs>
      <Circle cx={65} cy={65} r={63} fill={t.orbBack} />
      <Circle cx={67} cy={59} r={53} fill="url(#orb)" opacity={sky === 'cloudy' || sky === 'fog' ? 0.55 : 1} />
      {!isDay && <Circle cx={92} cy={38} r={42} fill={t.orbBack} clipPath="url(#orbClip)" />}
      <Path d="M 26.71 34.79 A 47 47 0 0 1 99.05 24.63" fill="none" stroke="#FFF8E3" strokeWidth={1.25} opacity={0.9} strokeLinecap="round" />
      {showCloud && (
        <G transform="translate(-653 -78)">
          {(sky === 'cloudy' || sky === 'fog') && (
            <G transform="translate(-40 -36) translate(718 143) scale(0.62) translate(-718 -143)" opacity={0.85}>
              <Path d={BIG_CLOUD} fill={t.cloud} stroke="#91C9C7" strokeWidth={1.15} />
            </G>
          )}
          <Path d={BIG_CLOUD} fill={t.cloud} stroke="#91C9C7" strokeWidth={1.15} />
          <Path d={BIG_CLOUD_LINE} fill="none" stroke="#9DCBCC" strokeWidth={1.1} opacity={0.9} />
        </G>
      )}
      {showCloud && sky !== 'partly' && sky !== 'cloudy' && (
        <G transform="translate(31 46) scale(1.5)">
          <Precip sky={sky} p={bigP} />
        </G>
      )}
    </Svg>
  );
}
