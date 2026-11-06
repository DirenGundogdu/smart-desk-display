import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { DesignText as T } from '../components/DesignText';
import { useNow } from '../hooks';
import { font, useScale } from '../theme';
import { describe } from '../weather/codes';
import { useWeatherData } from '../weather/WeatherContext';
import { Box, FNIcon, Header, HRule, Page, pad2, VRule } from './parts';
import { useFN } from './theme';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const deg = (n: number) => `${Math.round(n)}°`;

function utcLabel(d: Date) {
  const off = -d.getTimezoneOffset();
  const h = Math.floor(Math.abs(off) / 60);
  const m = Math.abs(off) % 60;
  return `UTC${off >= 0 ? '+' : '-'}${pad2(h)}${m ? `:${pad2(m)}` : ''}`;
}

export function FNHome() {
  const t = useFN();
  const k = useScale();
  const now = useNow(60000);
  const { weather, error } = useWeatherData();

  return (
    <Page>
      <Header section="/  EDITION  /  001" />

      {/* Time: hours on lime, minutes on black */}
      <Box x={20} y={71} w={241} h={176} color={t.lime} />
      <Box x={261} y={71} w={241} h={176} color={t.block} />
      <T x={33} y={93} size={9} color={t.onLime} font={font.heavy} spacing={1}>
        01   /   HOURS
      </T>
      <T x={276} y={93} size={9} color={t.lime} font={font.heavy} spacing={1}>
        02   /   MINUTES
      </T>
      <T x={30} y={224} size={155} color={t.onLime} font={font.black} spacing={-10}>
        {pad2(now.getHours())}
      </T>
      <T x={267} y={224} size={155} color={t.paper} font={font.black} spacing={-11}>
        {pad2(now.getMinutes())}
      </T>
      <Box x={254} y={156} w={14} h={13} color={t.orange} />
      <Box x={254} y={188} w={14} h={13} color={t.orange} />
      <Box x={20} y={247} w={482} h={12} color={t.blue} />
      <T x={29} y={256} size={7} color={t.paper} font={font.heavy} spacing={1}>
        LIVE / LOCAL TIME
      </T>
      <T x={369} y={256} size={7} color={t.paper} font={font.heavy} spacing={1}>
        {utcLabel(now)}
      </T>

      {/* Current weather */}
      <Svg style={{ position: 'absolute', left: 518 * k, top: 71 * k }} width={313 * k} height={188 * k} viewBox="518 71 313 188">
        <Defs>
          <ClipPath id="wc">
            <Rect x={518} y={71} width={313} height={188} />
          </ClipPath>
        </Defs>
        <Rect x={518} y={71} width={313} height={188} fill={t.blue} />
        <G clipPath="url(#wc)">
          <Circle cx={804} cy={100} r={67} fill={t.orange} />
          <Path d="M772 72 L811 72 L831 93 L831 105 Z" fill={t.lime} />
        </G>
      </Svg>
      <T x={534} y={93} size={10} color={t.paper} font={font.heavy} spacing={1.1}>
        OUTSIDE / CURRENT
      </T>
      {weather ? (
        (() => {
          const c = weather.current;
          const d = describe(c.code);
          return (
            <>
              <View style={{ position: 'absolute', left: 530 * k, top: (186 - 1.07 * 103) * k, flexDirection: 'row' }}>
                <T x={0} y={0} size={103} color={t.paper} font={font.black} spacing={-8} style={{ position: 'relative', left: 0, top: 0 }}>
                  {Math.round(c.temp)}
                </T>
                <T x={0} y={0} size={51} color={t.paper} font={font.heavy} style={{ position: 'relative', left: 10 * k, top: 4 * k }}>
                  °
                </T>
              </View>
              <View style={{ position: 'absolute', left: 744 * k, top: 138 * k }}>
                <FNIcon sky={d.sky} isDay={c.isDay} size={49 * k} sun={t.dark ? t.lime : t.orange} cloud={t.dark ? t.ink : t.paper} accent={t.paper} />
              </View>
              <HRule y={198} x1={534} x2={815} color={t.paper} />
              <T x={535} y={215} size={13} color={t.paper} font={font.heavy} spacing={0.6}>
                {d.label.toUpperCase()}
              </T>
              <T x={535} y={237} size={10} color={t.paper} font={font.semibold} spacing={0.2}>
                FEELS {deg(c.feelsLike)}
              </T>
              <T x={631} y={237} size={10} color={t.paper} font={font.semibold} spacing={0.2}>
                RH {c.humidity}%
              </T>
              <T x={719} y={237} size={9.5} color={t.paper} font={font.semibold} spacing={0.2}>
                W {Math.round(c.wind)} KM/H
              </T>
            </>
          );
        })()
      ) : (
        <T x={535} y={150} size={13} color={t.paper} font={font.heavy}>
          {error ? 'WEATHER UNAVAILABLE' : 'LOADING…'}
        </T>
      )}

      {/* Next 24 hours */}
      <HRule y={274} color={t.ink} width={1.2} />
      <T x={21} y={294} size={15} color={t.ink} font={font.black} spacing={0.2}>
        NEXT
      </T>
      <T x={21} y={309} size={10} color={t.muted} font={font.heavy} spacing={1}>
        24 HOURS
      </T>
      {weather?.hourly
        .filter((_, i) => i % 3 === 0)
        .slice(0, 8)
        .map((h, i) => {
          const x = 142 + 83.3 * i;
          return (
            <View key={h.time}>
              {i > 0 && <VRule x={x - 10} y1={280} y2={321} color={t.rule} />}
              <T x={x} y={289} size={10} color={t.muted} font={font.heavy} spacing={0.1}>
                {i === 0 ? 'NOW' : h.time.slice(11, 16)}
              </T>
              <T x={x} y={316} size={23} color={t.ink} font={font.heavy} spacing={-0.9}>
                {deg(h.temp)}
              </T>
              {h.rainChance >= 20 ? (
                <T x={x + 51} y={316} size={9} color={t.rain} font={font.heavy}>
                  {h.rainChance}%
                </T>
              ) : (
                <View style={{ position: 'absolute', left: (x + 49) * k, top: 297 * k }}>
                  <FNIcon sky={describe(h.code).sky} isDay={h.isDay} size={16 * k} sun={t.sun} cloud={t.cloud} accent={t.sun} />
                </View>
              )}
            </View>
          );
        })}

      {/* Five days */}
      <HRule y={327} color={t.ink} width={1.1} />
      <T x={21} y={346} size={15} color={t.ink} font={font.black} spacing={0.1}>
        FIVE
      </T>
      <T x={21} y={361} size={10} color={t.muted} font={font.heavy} spacing={1}>
        DAYS
      </T>
      {weather?.daily.slice(0, 5).map((d, i) => {
        const x = 142 + 138 * i;
        const [y, m, dd] = d.date.split('-').map(Number);
        return (
          <View key={d.date}>
            {i > 0 && <VRule x={x - 10} y1={332} y2={364} color={t.rule} />}
            <T x={x} y={343} size={9.5} color={t.muted} font={font.heavy} spacing={0.1}>
              {i === 0 ? 'TODAY' : DAYS[new Date(y, m - 1, dd).getDay()]}
            </T>
            {d.rainChance >= 20 && (
              <T x={x + 93} y={343} size={9} color={t.rain} font={font.heavy}>
                {d.rainChance}%
              </T>
            )}
            <View style={{ position: 'absolute', left: x * k, top: 345 * k }}>
              <FNIcon sky={describe(d.code).sky} size={18 * k} sun={t.sun} cloud={t.cloud} accent={t.sun} />
            </View>
            <T x={x + 24} y={360} size={12.3} color={t.ink} font={font.bold} spacing={-0.2}>
              {deg(d.max)} / {deg(d.min)}
            </T>
          </View>
        );
      })}
    </Page>
  );
}
