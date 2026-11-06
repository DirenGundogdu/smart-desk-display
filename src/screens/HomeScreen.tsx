import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Rect, Stop } from 'react-native-svg';

import { Backdrop } from '../components/Backdrop';
import { ColorPanel } from '../components/ColorPanel';
import { DesignText as T } from '../components/DesignText';
import { StudioClock } from '../components/Disc';
import { useNow } from '../hooks';
import { DESIGN, font, useScale, useTheme } from '../theme';
import { describe } from '../weather/codes';
import { ON_BAND, OUTLINED, WeatherArt, WeatherIcon } from '../weather/icons';
import { useWeatherData } from '../weather/WeatherContext';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SEASONS = ['WINTER', 'WINTER', 'SPRING', 'SPRING', 'SPRING', 'SUMMER', 'SUMMER', 'SUMMER', 'FALL', 'FALL', 'FALL', 'WINTER'];

const HOUR_STEP = 3;
const deg = (n: number) => `${Math.round(n)}°`;

function season(month: number, latitude: number) {
  // Southern hemisphere is six months out.
  return SEASONS[latitude < 0 ? (month + 6) % 12 : month];
}

function dayLabel(date: string, index: number) {
  if (index === 0) return 'TODAY';
  const [y, m, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()].slice(0, 3).toUpperCase();
}

// Right-hand side x positions are in full-screen design coordinates; this view starts at x = 330.
const OX = DESIGN.panel;

export function HomeScreen() {
  const t = useTheme();
  const k = useScale();
  const now = useNow(60000);
  const { weather, error } = useWeatherData();
  const at = (x: number) => x - OX;

  const header = (
    <>
      <T x={at(353)} y={55} size={40} color={t.title} font={font.black} spacing={-1.6} style={{ width: 300 * k }}>
        {WEEKDAYS[now.getDay()]}.
      </T>
      <T x={at(355)} y={73} size={10} color={t.accentText} font={font.heavy} spacing={1.8}>
        {String(now.getDate()).padStart(2, '0')} {MONTHS[now.getMonth()]} {now.getFullYear()}
      </T>
    </>
  );

  let body = null;
  if (!weather) {
    body = (
      <T x={at(354)} y={150} size={14} color={t.meta} font={font.semibold}>
        {error ? 'Weather unavailable — retrying' : 'Loading weather…'}
      </T>
    );
  } else {
    const { current } = weather;
    const cur = describe(current.code);
    const hours = weather.hourly.filter((_, i) => i % HOUR_STEP === 0).slice(0, 8);
    const bandX = at(347);

    body = (
      <>
        <View style={[styles.row, { position: 'absolute', right: 22 * k, top: 33 * k, gap: 8 * k }]}>
          <View style={{ width: 6.8 * k, height: 6.8 * k, borderRadius: 3.4 * k, backgroundColor: t.cityDot }} />
          <T x={0} y={0} size={11} color={t.city} font={font.heavy} spacing={1.3} style={{ position: 'relative', left: 0, top: 0 }}>
            {weather.place.name.toUpperCase()}
          </T>
        </View>

        <T x={at(354)} y={108} size={9.4} color={t.label} font={font.heavy} spacing={1.85}>
          IT FEELS LIKE {season(now.getMonth(), weather.place.latitude)}
        </T>

        <View style={[styles.row, { position: 'absolute', left: at(342) * k, top: 94 * k, alignItems: 'flex-start' }]}>
          <T x={0} y={0} size={111} color={t.text} font={font.black} spacing={-8} style={{ position: 'relative', left: 0, top: 0, lineHeight: 120 * k }}>
            {Math.round(current.temp)}
          </T>
          <View
            style={{
              width: 22 * k,
              height: 22 * k,
              borderRadius: 11 * k,
              borderWidth: 6 * k,
              borderColor: t.degree,
              marginLeft: 14 * k,
              marginTop: 18 * k,
            }}
          />
        </View>
        <T x={at(357)} y={216} size={18} color={t.sub} font={font.bold} style={{ width: 260 * k }}>
          {cur.label}
        </T>

        <View style={{ position: 'absolute', left: at(653) * k, top: 78 * k }}>
          <WeatherArt sky={cur.sky} isDay={current.isDay} size={130 * k} />
        </View>
        <T x={at(718)} y={206} size={9.6} color={t.meta} font={font.heavy} spacing={0.6} anchor="middle" width={220}>
          FEELS {deg(current.feelsLike)}
          {'   •   '}HUM {current.humidity}%
        </T>
        <T x={at(718)} y={224} size={9.1} color={t.meta} font={font.heavy} spacing={0.6} anchor="middle" width={220}>
          WIND {Math.round(current.wind)} KM/H
        </T>

        {/* Hourly band */}
        <Svg style={{ position: 'absolute', left: bandX * k, top: 231 * k }} width={482 * k} height={76 * k} viewBox="0 0 482 76">
          <Defs>
            <LinearGradient id="band" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={t.band[0]} />
              <Stop offset="0.55" stopColor={t.band[1]} />
              <Stop offset="1" stopColor={t.band[2]} />
            </LinearGradient>
          </Defs>
          <Rect width={482} height={76} rx={18} fill="url(#band)" />
          <Rect x={11} y={0} width={53} height={3} rx={1} fill={t.bandAccent} />
          <Rect x={8} y={9} width={54} height={62} rx={12} fill={t.bandCell} />
        </Svg>
        {hours.map((h, i) => {
          const cx = 382 + 58.3 * i;
          const d = describe(h.code);
          return (
            <View key={h.time}>
              <T x={at(cx)} y={251} size={9.5} color={i === 0 ? '#FFE9D5' : t.bandLabel} font={font.heavy} anchor="middle" width={56}>
                {i === 0 ? 'NOW' : h.time.slice(11, 16)}
              </T>
              <View style={{ position: 'absolute', left: at(cx - 11) * k, top: 257 * k }}>
                <WeatherIcon sky={d.sky} isDay={h.isDay} size={22 * k} palette={ON_BAND} />
              </View>
              {h.rainChance >= 20 && (
                <T x={at(cx + 29)} y={278} size={6.7} color={t.rainOnBand} font={font.heavy} anchor="end" width={30}>
                  {h.rainChance}%
                </T>
              )}
              <T x={at(cx)} y={295} size={17} color="#FFFFFF" font={font.bold} anchor="middle" width={56}>
                {deg(h.temp)}
              </T>
            </View>
          );
        })}

        {/* Five-day forecast */}
        <T x={at(354)} y={318} size={9.7} color={t.label} font={font.heavy} spacing={1.6}>
          FIVE-DAY FORECAST
        </T>
        <Svg style={{ position: 'absolute', left: at(353) * k, top: 323 * k }} width={473 * k} height={2 * k}>
          <Line x1={0} y1={1 * k} x2={473 * k} y2={1 * k} stroke={t.divider} strokeWidth={0.9 * k} opacity={0.66} />
        </Svg>
        {weather.daily.slice(0, 5).map((d, i) => {
          const x = 354 + 95 * i;
          const w = describe(d.code);
          return (
            <View key={d.date}>
              <T x={at(x)} y={338} size={9.2} color={i === 0 ? t.todayLabel : t.dayLabel} font={font.heavy} spacing={0.3}>
                {dayLabel(d.date, i)}
              </T>
              <View style={{ position: 'absolute', left: at(x - 1) * k, top: 342 * k }}>
                <WeatherIcon sky={w.sky} size={16 * k} palette={OUTLINED} />
              </View>
              <T x={at(x + 29)} y={357} size={18} color={t.dark ? '#E7E7EB' : '#292A40'} font={font.heavy}>
                {deg(d.max)}
              </T>
              <T x={at(x + 62)} y={356} size={10.7} color={t.min} font={font.bold}>
                {deg(d.min)}
              </T>
              <T x={at(x + 84)} y={369} size={8.1} color={d.rainChance >= 20 ? t.rain : t.rainLow} font={font.bold} anchor="end" width={30}>
                {d.rainChance}%
              </T>
            </View>
          );
        })}
      </>
    );
  }

  return (
    <View style={styles.root}>
      <Backdrop />
      <ColorPanel title="HOME" footer="THE TIME IS YOURS.">
        <StudioClock />
      </ColorPanel>
      <View style={styles.right}>
        {header}
        {body}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  right: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
