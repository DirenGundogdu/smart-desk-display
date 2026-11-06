import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useDesign } from '../design';
import { usePager } from '../pager/context';
import { DESIGN, font, useScale, useTheme } from '../theme';

// "HOME", 1 -> "H O M E  /  01"
const spaced = (word: string, n: number) => `${word.split('').join(' ')}  /  ${String(n).padStart(2, '0')}`;

// The coloured left block shared by every screen: gradient, light streaks, page label, tagline and page dots.
export function ColorPanel({ title, footer, children }: { title: string; footer: string; children?: ReactNode }) {
  const t = useTheme();
  const k = useScale();
  const { index, count, goTo } = usePager();
  const { toggle } = useDesign();

  return (
    <View style={{ width: DESIGN.panel * k, height: '100%', overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${DESIGN.panel} ${DESIGN.height}`} preserveAspectRatio="xMinYMin slice" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="panel" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={t.panel[0]} />
            <Stop offset="0.45" stopColor={t.panel[1]} />
            <Stop offset="1" stopColor={t.panel[2]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={DESIGN.panel} height={DESIGN.height} fill="url(#panel)" />
        <Path d="M -75 88 C 94 -24 240 -11 342 93 L 342 -50 L -45 -50Z" fill="#FFE2AB" opacity={0.13} />
        <Path d="M -72 331 C 12 279 185 289 342 359 L 346 412 L -70 413 Z" fill="#6A3F86" opacity={0.18} />
        <Path d="M 281 -30 Q 125 131 286 307" fill="none" stroke="#FFE9BC" strokeWidth={1} opacity={0.35} />
        <Path d="M 315 -25 Q 150 131 317 329" fill="none" stroke="#FFF5CA" strokeWidth={1} opacity={0.2} />
      </Svg>

      {children}

      {/* Long-press the page label to switch art direction. */}
      <Pressable onLongPress={toggle} delayLongPress={700} hitSlop={10} style={{ position: 'absolute', left: 23 * k, top: 15 * k }}>
        <Text style={[styles.label, { fontSize: 10 * k, letterSpacing: 1.6 * k, color: t.panelText }]}>{spaced(title, index + 1)}</Text>
      </Pressable>
      <Text style={[styles.caps, { left: 22 * k, top: 357 * k, fontSize: 10 * k, letterSpacing: 1.5 * k, color: '#FFF2DD' }]}>
        {footer}
      </Text>
      {count > 1 && (
        <View style={[styles.dots, { left: 246 * k, top: 359 * k, gap: 6.5 * k }]}>
          {Array.from({ length: count }, (_, i) => {
            const r = (i === index ? 5.3 : 2.8) * k;
            return (
              <Pressable key={i} onPress={() => goTo(i)} hitSlop={8} style={{ width: 10.6 * k, alignItems: 'center' }}>
                <View style={{ width: r * 2, height: r * 2, borderRadius: r, backgroundColor: t.dots, opacity: i === index ? 1 : 0.42 }} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caps: { position: 'absolute', ...font.heavy },
  label: font.heavy,
  dots: { position: 'absolute', flexDirection: 'row', alignItems: 'center', height: 12 },
});
