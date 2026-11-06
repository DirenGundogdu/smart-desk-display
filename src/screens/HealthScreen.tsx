import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Backdrop } from '../components/Backdrop';
import { ColorPanel } from '../components/ColorPanel';
import { DesignText as T } from '../components/DesignText';
import { Disc, PanelSvg } from '../components/Disc';
import { hhmm, ServiceStatus, useHealth } from '../health/useHealth';
import { font, useScale, useTheme } from '../theme';

const TITLES: Record<string, string> = {
  CHECKING: 'Checking',
  OPERATIONAL: 'All good',
  DEGRADED: 'Slow going',
  'PARTIAL OUTAGE': 'Something’s down',
  OUTAGE: 'Offline',
};

export function HealthScreen() {
  const t = useTheme();
  const k = useScale();
  const h = useHealth();

  const tone = (s: ServiceStatus) => (s === 'ok' ? t.mint : s === 'slow' ? '#F9C06F' : s === 'down' ? t.danger : t.muted);
  const label = (s: ServiceStatus) => ({ ok: 'OK', slow: 'SLOW', down: 'DOWN', pending: '…' })[s];

  return (
    <View style={styles.root}>
      <Backdrop />
      <ColorPanel title="HEALTH" footer="EVERYTHING, AT A GLANCE.">
        <PanelSvg>
          <Disc progress={h.total ? h.online / h.total : 0} ticks={false} />
        </PanelSvg>
        <View style={{ position: 'absolute', left: 35 * k, width: 260 * k, top: 122 * k, alignItems: 'center' }}>
          <Text style={[styles.caps, { color: t.bandAccent, fontSize: 10 * k, letterSpacing: 2 * k }]}>SERVICES ONLINE</Text>
          <Text style={{ ...font.black, color: t.numeral, fontSize: 62 * k, lineHeight: 74 * k, letterSpacing: -2 * k }}>
            {h.online}/{h.total}
          </Text>
          <Text style={[styles.caps, { color: t.cream, fontSize: 9 * k, letterSpacing: 1.6 * k }]}>{h.headline}</Text>
        </View>
      </ColorPanel>

      <View style={styles.right}>
        <T x={23} y={55} size={40} color={t.title} font={font.black} spacing={-1.6} style={{ width: 380 * k }}>
          {TITLES[h.headline] ?? h.headline}.
        </T>
        <T x={25} y={73} size={10} color={t.accentText} font={font.heavy} spacing={1.8}>
          {h.degraded} SLOW  ·  {h.down} DOWN  ·  LAST CHECKED {hhmm(h.checkedAt)}
        </T>
        <Pressable onPress={h.refresh} hitSlop={10} style={[styles.row, { position: 'absolute', right: 22 * k, top: 33 * k, gap: 8 * k }]}>
          <View style={{ width: 6.8 * k, height: 6.8 * k, borderRadius: 3.4 * k, backgroundColor: t.cityDot }} />
          <Text style={[styles.caps, { color: t.city, fontSize: 11 * k }]}>{h.checking ? 'CHECKING…' : 'CHECK NOW'}</Text>
        </Pressable>

        <ScrollView style={{ position: 'absolute', left: 23 * k, right: 22 * k, top: 92 * k, bottom: 16 * k }}>
          {h.results.map((r) => (
            <View
              key={r.name}
              style={[styles.row, { height: 46 * k, marginBottom: 7 * k, borderRadius: 14 * k, paddingHorizontal: 16 * k, backgroundColor: t.surface }]}
            >
              <View style={{ width: 10 * k, height: 10 * k, borderRadius: 5 * k, backgroundColor: tone(r.status), marginRight: 14 * k }} />
              <Text style={{ ...font.bold, flex: 1, color: t.text, fontSize: 17 * k }}>{r.name}</Text>
              <Text style={{ ...font.semibold, color: t.muted, fontSize: 13 * k, marginRight: 20 * k }}>
                {r.ms != null ? `${r.ms} ms` : r.detail ?? '—'}
              </Text>
              <View style={{ minWidth: 54 * k, paddingVertical: 4 * k, borderRadius: 8 * k, backgroundColor: t.band[1], alignItems: 'center' }}>
                <Text style={[styles.caps, { color: tone(r.status), fontSize: 10 * k }]}>{label(r.status)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  right: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  caps: { letterSpacing: 1.3, ...font.heavy },
});
