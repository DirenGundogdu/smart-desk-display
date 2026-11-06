import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { DesignText as T } from '../components/DesignText';
import { Mode, usePomodoro } from '../pomodoro/usePomodoro';
import { font, useScale } from '../theme';
import { Box, Header, HRule, Page, pad2, VRule } from './parts';
import { useFN } from './theme';

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'focus', label: 'FOCUS' },
  { mode: 'short', label: 'SHORT BREAK' },
  { mode: 'long', label: 'LONG BREAK' },
];

// Same grid as the clock: minutes on lime, seconds on black, controls where the weather sits.
export function FNFocus() {
  const t = useFN();
  const k = useScale();
  const p = usePomodoro();
  if (!p) return <Page />;

  const total = Math.ceil(p.remaining / 1000);
  const label = MODES.find((m) => m.mode === p.mode)!.label;
  const nextMode = p.mode === 'focus' ? (p.round + 1 >= p.rounds ? 'LONG BREAK' : 'SHORT BREAK') : 'FOCUS';

  return (
    <Page>
      <Header section="/  FOCUS  /  TIMER" />

      <Box x={20} y={71} w={241} h={176} color={t.lime} />
      <Box x={261} y={71} w={241} h={176} color={t.block} />
      <T x={33} y={93} size={9} color={t.onLime} font={font.heavy} spacing={1}>
        01   /   MINUTES
      </T>
      <T x={276} y={93} size={9} color={t.lime} font={font.heavy} spacing={1}>
        02   /   SECONDS
      </T>
      <T x={30} y={224} size={155} color={t.onLime} font={font.black} spacing={-10}>
        {pad2(Math.floor(total / 60))}
      </T>
      <T x={267} y={224} size={155} color={t.paper} font={font.black} spacing={-11}>
        {pad2(total % 60)}
      </T>
      <Box x={254} y={156} w={14} h={13} color={t.orange} />
      <Box x={254} y={188} w={14} h={13} color={t.orange} />
      {/* Progress strip */}
      <Box x={20} y={247} w={482} h={12} color={t.blue} />
      <Box x={20} y={247} w={482 * Math.min(1, Math.max(0, p.progress))} h={12} color={t.orange} />
      <T x={29} y={256} size={7} color={t.paper} font={font.heavy} spacing={1}>
        {label}  /  SESSION {Math.min(p.round + 1, p.rounds)} OF {p.rounds}
      </T>
      <T x={369} y={256} size={7} color={t.paper} font={font.heavy} spacing={1}>
        {p.settings[p.mode]} MIN
      </T>

      {/* Controls */}
      <View style={{ position: 'absolute', left: 518 * k, top: 71 * k, width: 313 * k, height: 188 * k, backgroundColor: t.blue }}>
        <T x={16} y={22} size={10} color={t.paper} font={font.heavy} spacing={1.1}>
          MODE / MINUTES
        </T>
        {MODES.map((m, i) => {
          const on = p.mode === m.mode;
          const y = 34 + i * 30;
          return (
            <View key={m.mode} style={{ position: 'absolute', left: 16 * k, top: y * k, width: 281 * k, height: 26 * k, flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={() => p.setMode(m.mode)} hitSlop={6} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 * k }}>
                <View style={{ width: 9 * k, height: 9 * k, backgroundColor: on ? t.lime : 'transparent', borderWidth: 1.5, borderColor: t.paper }} />
                <Text style={{ ...font.heavy, color: t.paper, fontSize: 13 * k, letterSpacing: 0.6 * k, opacity: on ? 1 : 0.7 }}>{m.label}</Text>
              </Pressable>
              <Pressable onPress={() => p.adjust(m.mode, -1)} hitSlop={8} style={{ padding: 4 * k }}>
                <Icon name="minus" size={16 * k} color={t.paper} />
              </Pressable>
              <Text style={{ ...font.black, color: t.paper, fontSize: 16 * k, width: 30 * k, textAlign: 'center' }}>{p.settings[m.mode]}</Text>
              <Pressable onPress={() => p.adjust(m.mode, 1)} hitSlop={8} style={{ padding: 4 * k }}>
                <Icon name="plus" size={16 * k} color={t.paper} />
              </Pressable>
            </View>
          );
        })}
        <View style={{ position: 'absolute', left: 16 * k, top: 127 * k, width: 281 * k, height: 1, backgroundColor: t.paper, opacity: 0.65 }} />
        <View style={{ position: 'absolute', left: 16 * k, top: 137 * k, width: 281 * k, height: 40 * k, flexDirection: 'row', gap: 8 * k }}>
          <Pressable onPress={p.running ? p.pause : p.start} style={{ flex: 1, backgroundColor: t.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 * k }}>
            <Icon name={p.running ? 'pause' : 'play'} size={22 * k} color={t.onLime} />
            <Text style={{ ...font.black, color: t.onLime, fontSize: 15 * k, letterSpacing: 1 * k }}>{p.running ? 'PAUSE' : 'START'}</Text>
          </Pressable>
          <Pressable onPress={p.reset} style={{ width: 40 * k, backgroundColor: t.block, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="restart" size={20 * k} color={t.paper} />
          </Pressable>
          <Pressable onPress={p.skip} style={{ width: 40 * k, backgroundColor: t.block, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="skip-next" size={22 * k} color={t.paper} />
          </Pressable>
        </View>
      </View>

      {/* Today */}
      <HRule y={274} color={t.ink} width={1.2} />
      <T x={21} y={294} size={15} color={t.ink} font={font.black} spacing={0.2}>
        TODAY
      </T>
      <T x={21} y={309} size={10} color={t.muted} font={font.heavy} spacing={1}>
        SESSIONS
      </T>
      {[
        ['DONE', pad2(p.doneToday)],
        ['FOCUSED', `${p.doneToday * p.settings.focus}m`],
        ['ROUND', `${p.round}/${p.rounds}`],
        ['UP NEXT', nextMode],
      ].map(([l, v], i) => {
        const x = 142 + 172 * i;
        return (
          <View key={l}>
            {i > 0 && <VRule x={x - 10} y1={280} y2={321} color={t.rule} />}
            <T x={x} y={289} size={10} color={t.muted} font={font.heavy} spacing={0.1}>
              {l}
            </T>
            <T x={x} y={316} size={i === 3 ? 17 : 23} color={t.ink} font={font.heavy} spacing={-0.6}>
              {v}
            </T>
          </View>
        );
      })}
      <HRule y={327} color={t.ink} width={1.1} />
      <T x={21} y={352} size={15} color={t.ink} font={font.black} spacing={0.1}>
        ONE THING AT A TIME.
      </T>
      <View style={{ position: 'absolute', left: 642 * k, top: 340 * k, flexDirection: 'row', gap: 6 * k }}>
        {Array.from({ length: p.rounds }, (_, i) => (
          <View key={i} style={{ width: 40 * k, height: 8 * k, backgroundColor: i < p.round ? t.orange : t.rule }} />
        ))}
      </View>
    </Page>
  );
}
