import { Pressable, ScrollView, View } from 'react-native';

import { DesignText as T } from '../components/DesignText';
import { hhmm, ServiceStatus, useHealth } from '../health/useHealth';
import { font, useScale } from '../theme';
import { Header, HRule, Page, pad2 } from './parts';
import { useFN } from './theme';

const ROW_H = 27;

export function FNHealth() {
  const t = useFN();
  const k = useScale();
  const h = useHealth();
  const outage = h.headline.includes('OUTAGE');

  const tone = (s: ServiceStatus) => (s === 'ok' ? t.blue : s === 'pending' ? t.rule : t.orange);
  const label = (s: ServiceStatus) => ({ ok: 'OK', slow: 'SLOW', down: 'DOWN', pending: '…' })[s];

  return (
    <Page>
      <Header section="/  SERVICES  /  HEALTH" />

      <View style={{ position: 'absolute', left: 20 * k, top: 72 * k, width: 252 * k, height: 160 * k, backgroundColor: t.block }}>
        <T x={14} y={25} size={11} color={t.lime} font={font.heavy} spacing={1}>
          LIVE SYSTEM STATE
        </T>
        <View style={{ position: 'absolute', left: 8 * k, top: (117 - 1.07 * 105) * k, flexDirection: 'row', alignItems: 'flex-end' }}>
          <T x={0} y={0} size={105} color={t.paper} font={font.black} spacing={-6} style={{ position: 'relative', left: 0, top: 0 }}>
            {pad2(h.online)}
          </T>
          <T x={0} y={0} size={43} color={t.lime} font={font.black} spacing={-2} style={{ position: 'relative', left: 8 * k, top: -12 * k }}>
            /{pad2(h.total)}
          </T>
        </View>
        <T x={16} y={144} size={11} color={t.paper} font={font.heavy} spacing={0.8}>
          SERVICES ONLINE
        </T>
      </View>

      {/* Tap to check now */}
      <Pressable
        onPress={h.refresh}
        style={{ position: 'absolute', left: 285 * k, top: 72 * k, width: 546 * k, height: 160 * k, backgroundColor: outage ? t.orange : t.lime }}
      >
        <T x={18} y={25} size={11} color={t.onLime} font={font.heavy} spacing={1}>
          PLATFORM / ALL REGIONS{h.checking ? '  ·  CHECKING…' : ''}
        </T>
        <T x={15} y={96} size={h.headline.length > 11 ? 44 : 58} color={t.onLime} font={font.black} spacing={-3} style={{ width: 520 * k }}>
          {h.headline}
        </T>
        <View style={{ position: 'absolute', left: 18 * k, top: 111 * k, width: 515 * k, height: 1, backgroundColor: t.onLime }} />
        <T x={18} y={135} size={12} color={t.onLime} font={font.heavy} spacing={0.4}>
          {h.degraded} DEGRADED    /    {h.down} DOWN    /    LAST CHECKED {hhmm(h.checkedAt)}
        </T>
      </Pressable>

      <HRule y={236} color={t.rule} />
      <ScrollView style={{ position: 'absolute', left: 20 * k, top: 236.5 * k, width: 811 * k, height: 140 * k }}>
        {h.results.map((r) => (
          <View key={r.name} style={{ height: ROW_H * k, borderBottomWidth: 1, borderColor: t.rule }}>
            <View style={{ position: 'absolute', left: 7 * k, top: 10 * k, width: 8 * k, height: 8 * k, borderRadius: 4 * k, backgroundColor: tone(r.status) }} />
            <T x={32} y={19} size={16.5} color={t.ink} font={font.heavy} spacing={-0.5} style={{ width: 500 * k }}>
              {r.name.toUpperCase()}
            </T>
            <T x={572} y={19} size={12} color={t.muted} font={font.heavy}>
              {r.ms != null ? `${r.ms} ms` : r.detail ?? '—'}
            </T>
            <T x={770} y={19} size={11} color={tone(r.status)} font={font.black} anchor="end" width={80}>
              {label(r.status)}
            </T>
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}
