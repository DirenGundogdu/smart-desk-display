import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Backdrop } from '../components/Backdrop';
import { ColorPanel } from '../components/ColorPanel';
import { DesignText as T } from '../components/DesignText';
import { Disc, PanelSvg } from '../components/Disc';
import { Mode, usePomodoro } from '../pomodoro/usePomodoro';
import { font, useScale, useTheme } from '../theme';

const MODES: { mode: Mode; label: string; short: string; title: string }[] = [
  { mode: 'focus', label: 'FOCUS', short: 'FOCUS', title: 'Focus' },
  { mode: 'short', label: 'SHORT BREAK', short: 'SHORT', title: 'Breathe' },
  { mode: 'long', label: 'LONG BREAK', short: 'LONG', title: 'Recharge' },
];

const fmt = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export function PomodoroScreen() {
  const t = useTheme();
  const k = useScale();
  const p = usePomodoro();
  if (!p) return null;

  const current = MODES.find((m) => m.mode === p.mode)!;
  const session = p.mode === 'focus' ? `SESSION ${p.round + 1} OF ${p.rounds}` : `${p.round} OF ${p.rounds} SESSIONS DONE`;

  return (
    <View style={styles.root}>
      <Backdrop />
      <ColorPanel title="FOCUS" footer="ONE THING AT A TIME.">
        <PanelSvg>
          <Disc progress={p.progress} ticks={false} />
        </PanelSvg>
        {/* Centred on the disc at (165, 180) in panel design space. */}
        <View style={{ position: 'absolute', left: 35 * k, width: 260 * k, top: 120 * k, alignItems: 'center' }}>
          <Text style={[styles.caps, { color: t.bandAccent, fontSize: 10 * k, letterSpacing: 2 * k }]}>{current.label}</Text>
          <Text style={[styles.time, { fontSize: 62 * k, lineHeight: 74 * k, letterSpacing: -2 * k, color: t.numeral }]}>{fmt(p.remaining)}</Text>
          <View style={[styles.row, { gap: 8 * k, marginTop: 2 * k }]}>
            {Array.from({ length: p.rounds }, (_, i) => (
              <View
                key={i}
                style={{
                  width: 8 * k,
                  height: 8 * k,
                  borderRadius: 4 * k,
                  backgroundColor: i < p.round ? t.cream : 'rgba(255,245,199,0.25)',
                }}
              />
            ))}
          </View>
        </View>
      </ColorPanel>

      <View style={styles.right}>
        <T x={23} y={55} size={40} color={t.title} font={font.black} spacing={-1.6} style={{ width: 380 * k }}>
          {current.title}.
        </T>
        <T x={25} y={73} size={10} color={t.accentText} font={font.heavy} spacing={1.8}>
          {session}
        </T>
        <View style={[styles.row, { position: 'absolute', right: 22 * k, top: 33 * k, gap: 8 * k }]}>
          <View style={{ width: 6.8 * k, height: 6.8 * k, borderRadius: 3.4 * k, backgroundColor: t.cityDot }} />
          <Text style={[styles.caps, { color: t.city, fontSize: 11 * k }]}>
            {p.doneToday} {p.doneToday === 1 ? 'POMODORO' : 'POMODOROS'} TODAY
          </Text>
        </View>

        <View style={{ position: 'absolute', left: 17 * k, right: 22 * k, top: 96 * k, bottom: 22 * k, justifyContent: 'space-between' }}>
          <View style={[styles.row, { gap: 8 * k }]}>
            {MODES.map((m) => {
              const on = p.mode === m.mode;
              return (
                <Pressable
                  key={m.mode}
                  onPress={() => p.setMode(m.mode)}
                  style={[styles.chip, { height: 36 * k, backgroundColor: on ? t.band[1] : t.surface }]}
                >
                  <Text style={[styles.caps, { fontSize: 10 * k, color: on ? '#FFE9D5' : t.dayLabel }]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.row, styles.controls, { height: 76 * k, borderRadius: 18 * k, backgroundColor: t.band[1], paddingHorizontal: 10 * k }]}>
            <Pressable onPress={p.reset} hitSlop={8} style={[styles.round, { width: 54 * k, height: 54 * k, borderRadius: 14 * k, backgroundColor: t.bandCell }]}>
              <Icon name="restart" size={26 * k} color="#FFE9D5" />
            </Pressable>
            <Pressable
              onPress={p.running ? p.pause : p.start}
              style={[styles.primary, { height: 56 * k, borderRadius: 16 * k, backgroundColor: t.accent, gap: 8 * k }]}
            >
              <Icon name={p.running ? 'pause' : 'play'} size={30 * k} color="#fff" />
              <Text style={[styles.caps, { color: '#fff', fontSize: 15 * k, letterSpacing: 2 * k }]}>{p.running ? 'PAUSE' : 'START'}</Text>
            </Pressable>
            <Pressable onPress={p.skip} hitSlop={8} style={[styles.round, { width: 54 * k, height: 54 * k, borderRadius: 14 * k, backgroundColor: t.bandCell }]}>
              <Icon name="skip-next" size={28 * k} color="#FFE9D5" />
            </Pressable>
          </View>

          <View>
            <Text style={[styles.caps, { color: t.label, fontSize: 9.7 * k, letterSpacing: 1.6 * k, marginLeft: 6 * k }]}>DURATIONS</Text>
            <View style={{ height: 0.9, backgroundColor: t.divider, opacity: 0.66, marginTop: 6 * k, marginLeft: 6 * k }} />
            <View style={[styles.row, { marginTop: 4 * k }]}>
              {MODES.map((m) => (
                <View key={m.mode} style={[styles.row, styles.setting, { paddingLeft: 6 * k }]}>
                  <Text style={[styles.caps, { color: t.dayLabel, fontSize: 9.2 * k, flex: 1 }]} numberOfLines={1}>
                    {m.short}
                  </Text>
                  <Pressable onPress={() => p.adjust(m.mode, -1)} hitSlop={8} style={styles.step}>
                    <Icon name="minus" size={18 * k} color={t.muted} />
                  </Pressable>
                  <Text style={{ ...font.heavy, color: t.dark ? '#E7E7EB' : '#292A40', fontSize: 18 * k, minWidth: 26 * k, textAlign: 'center' }}>
                    {p.settings[m.mode]}
                  </Text>
                  <Pressable onPress={() => p.adjust(m.mode, 1)} hitSlop={8} style={styles.step}>
                    <Icon name="plus" size={18 * k} color={t.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  right: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  caps: { letterSpacing: 1.3, ...font.heavy },
  time: { ...font.black, fontVariant: ['tabular-nums'] },
  chip: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  controls: { justifyContent: 'space-between' },
  round: { alignItems: 'center', justifyContent: 'center' },
  primary: { flex: 1, marginHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  setting: { flex: 1, paddingVertical: 6 },
  step: { padding: 6 },
});
