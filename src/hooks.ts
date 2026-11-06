import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { WEATHER_REFRESH_MS } from './config';
import { fetchWeather, loadCachedWeather, Weather } from './weather/api';

export function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

// Current time, updated on each whole second (or minute), paused while the app is in the background.
export function useNow(stepMs: 1000 | 60000) {
  const active = useAppActive();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, stepMs - (d.getTime() % stepMs) + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, [active, stepMs]);
  return now;
}

export function useWeather() {
  const active = useAppActive();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCachedWeather().then((w) => w && setWeather((cur) => cur ?? w));
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const cached = await loadCachedWeather();
        const age = cached ? Date.now() - cached.fetchedAt : Infinity;
        const fresh = cached && age < WEATHER_REFRESH_MS;
        const w = fresh ? cached : await fetchWeather();
        if (!cancelled) {
          setWeather(w);
          setError(null);
        }
        timer = setTimeout(refresh, fresh ? WEATHER_REFRESH_MS - age : WEATHER_REFRESH_MS);
      } catch (e) {
        if (!cancelled) setError(String(e));
        timer = setTimeout(refresh, 5 * 60 * 1000);
      }
    };
    refresh();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);

  return { weather, error };
}
