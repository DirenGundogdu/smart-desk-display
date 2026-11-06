import { memo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';

import { SHOW_SECONDS } from '../config';
import { useNow } from '../hooks';
import { usePager } from '../pager/context';
import { DESIGN, useTheme } from '../theme';

// Everything is drawn in the panel's 330×393 design space, centred at (165, 180).
const CX = 165;
const CY = 180;

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
};

const arc = (r: number, from: number, to: number) => {
  const a = polar(r, from);
  const b = polar(r, to);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
};

// The glowing disc + navy face. `progress` (0..1) swaps the decorative arcs for a progress ring.
export const Disc = memo(function Disc({ progress, ticks = true }: { progress?: number; ticks?: boolean }) {
  const t = useTheme();
  return (
    <>
      <Defs>
        <LinearGradient id="disc" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={t.panelCircle[0]} />
          <Stop offset="0.55" stopColor={t.panelCircle[1]} />
          <Stop offset="1" stopColor={t.panelCircle[2]} />
        </LinearGradient>
        <LinearGradient id="face" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={t.face[0]} />
          <Stop offset="1" stopColor={t.face[1]} />
        </LinearGradient>
      </Defs>
      <Circle cx={CX} cy={CY} r={154} fill="url(#disc)" opacity={0.6} />
      <Circle cx={CX} cy={CY} r={143} fill="none" stroke={t.ring} strokeWidth={1.25} opacity={0.7} />
      {progress === undefined ? (
        <>
          <Path d="M 61.5 287.18 A 149 149 0 0 1 38.64 101.04" fill="none" stroke={t.cream} strokeWidth={4} opacity={0.86} strokeLinecap="round" />
          <Path d="M 218.04 41.83 A 148 148 0 0 1 309.77 149.23" fill="none" stroke={t.arc} strokeWidth={3} opacity={0.87} strokeLinecap="round" />
          <Path d="M 295.68 249.48 A 148 148 0 0 1 236.75 309.44" fill="none" stroke={t.mint} strokeWidth={3} opacity={0.9} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx={CX} cy={CY} r={149} fill="none" stroke={t.cream} strokeWidth={4} opacity={0.2} />
          {progress > 0.002 && (
            <Path
              d={progress >= 0.999 ? arc(149, 0, 359.9) : arc(149, 0, progress * 360)}
              fill="none"
              stroke={t.cream}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
        </>
      )}
      <Circle cx={CX} cy={CY} r={130} fill="url(#face)" stroke="#FFE7D9" strokeWidth={1.2} />
      <Circle cx={CX} cy={CY} r={119} fill="none" stroke="#E5B8C5" strokeWidth={0.6} opacity={0.3} />
      {ticks &&
        Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const a = polar(major ? 104 : 110.4, i * 6);
          const b = polar(major ? 117 : 114.4, i * 6);
          return (
            <Line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={major ? t.majorTick : t.minorTick}
              strokeWidth={major ? 2.7 : 0.9}
              strokeLinecap="round"
              opacity={major ? 0.94 : 0.55}
            />
          );
        })}
    </>
  );
});

const Numerals = memo(function Numerals({ color }: { color: string }) {
  return (
    <G>
      {(
        [
          ['12', CX, 94],
          ['3', 256, 185],
          ['6', CX, 276],
          ['9', 74, 185],
        ] as const
      ).map(([n, x, y]) => (
        <SvgText key={n} x={x} y={y} fontFamily="Inter_700Bold" fontSize={18} fill={color} textAnchor="middle">
          {n}
        </SvgText>
      ))}
    </G>
  );
});

function Hand({ deg, tail, tip, width, color }: { deg: number; tail: number; tip: number; width: number; color: string }) {
  const a = polar(-tail, deg);
  const b = polar(tip, deg);
  return <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

// Full-panel overlay; sits inside ColorPanel.
export function PanelSvg({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${DESIGN.panel} ${DESIGN.height}`} preserveAspectRatio="xMinYMin slice" style={StyleSheet.absoluteFill}>
      {children}
    </Svg>
  );
}

export function StudioClock() {
  const t = useTheme();
  const { index, current } = usePager();
  // Off-screen neighbours stay mounted; don't redraw them every second.
  const now = useNow(SHOW_SECONDS && index === current ? 1000 : 60000);
  const s = now.getSeconds();
  const m = now.getMinutes() + (SHOW_SECONDS ? s / 60 : 0);
  const h = (now.getHours() % 12) + m / 60;

  return (
    <PanelSvg>
      <Disc />
      <Numerals color={t.numeral} />
      <Hand deg={h * 30} tail={9} tip={66} width={10} color={t.hourHand} />
      <Hand deg={m * 6} tail={10} tip={100} width={5.4} color={t.minuteHand} />
      {SHOW_SECONDS && <Hand deg={s * 6} tail={22} tip={113} width={1.8} color={t.secondHand} />}
      <Circle cx={CX} cy={CY} r={5.5} fill="#FFBE8C" />
      <Circle cx={CX} cy={CY} r={2.5} fill="#49344D" />
    </PanelSvg>
  );
}
