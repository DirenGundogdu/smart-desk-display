import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';

export type Mode = 'focus' | 'short' | 'long';

// Minutes per mode, and focus sessions before a long break.
type Settings = Record<Mode, number> & { rounds: number };

type Timer = {
  mode: Mode;
  // Focus sessions finished in the current cycle.
  round: number;
  // Set while running; the countdown is derived from it so it stays right after the app sleeps.
  endsAt: number | null;
  // Time left while paused.
  remaining: number;
};

type State = { settings: Settings; timer: Timer; stats: { day: string; done: number } };

const KEY = 'pomodoro.v1';
const MIN = 60 * 1000;
const DEFAULT_SETTINGS: Settings = { focus: 25, short: 5, long: 15, rounds: 4 };

const today = () => new Date().toDateString();
const durationOf = (s: Settings, m: Mode) => s[m] * MIN;

function initialState(): State {
  return {
    settings: DEFAULT_SETTINGS,
    timer: { mode: 'focus', round: 0, endsAt: null, remaining: durationOf(DEFAULT_SETTINGS, 'focus') },
    stats: { day: today(), done: 0 },
  };
}

export function usePomodoro() {
  const [state, setState] = useState<State | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      loaded.current = true;
      setState(raw ? (JSON.parse(raw) as State) : initialState());
    });
  }, []);

  useEffect(() => {
    if (loaded.current && state) AsyncStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const running = state?.timer.endsAt != null;

  // Moves to the next mode; `finished` counts the session and alerts.
  const advance = (finished: boolean) =>
    setState((s) => {
      if (!s) return s;
      const { settings, timer } = s;
      const stats = s.stats.day === today() ? s.stats : { day: today(), done: 0 };
      let round = timer.round;
      let next: Mode = 'focus';
      let done = stats.done;
      if (timer.mode === 'focus') {
        if (finished) done += 1;
        round += 1;
        next = round >= settings.rounds ? 'long' : 'short';
      } else if (timer.mode === 'long') {
        round = 0;
      }
      return {
        settings,
        stats: { day: stats.day, done },
        timer: { mode: next, round, endsAt: null, remaining: durationOf(settings, next) },
      };
    });

  // Tick only while running; the tick also notices when time is up.
  const endsAt = state?.timer.endsAt ?? null;
  useEffect(() => {
    if (endsAt == null) return;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (n >= endsAt) {
        Vibration.vibrate([0, 600, 300, 600, 300, 600]);
        advance(true);
      }
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [endsAt]);

  const update = (fn: (s: State) => State) => setState((s) => s && fn(s));

  const actions = {
    start: () => update((s) => ({ ...s, timer: { ...s.timer, endsAt: Date.now() + s.timer.remaining } })),
    pause: () =>
      update((s) => ({
        ...s,
        timer: { ...s.timer, endsAt: null, remaining: Math.max(0, (s.timer.endsAt ?? Date.now()) - Date.now()) },
      })),
    reset: () =>
      update((s) => ({ ...s, timer: { ...s.timer, endsAt: null, remaining: durationOf(s.settings, s.timer.mode) } })),
    skip: () => advance(false),
    setMode: (mode: Mode) =>
      update((s) => ({ ...s, timer: { ...s.timer, mode, endsAt: null, remaining: durationOf(s.settings, mode) } })),
    adjust: (mode: Mode, delta: number) =>
      update((s) => {
        const minutes = Math.min(90, Math.max(1, s.settings[mode] + delta));
        const settings = { ...s.settings, [mode]: minutes };
        // Apply to the clock only if it's showing this mode and hasn't started.
        const untouched = s.timer.mode === mode && s.timer.endsAt == null && s.timer.remaining === durationOf(s.settings, mode);
        return { ...s, settings, timer: untouched ? { ...s.timer, remaining: durationOf(settings, mode) } : s.timer };
      }),
  };

  if (!state) return null;
  const { timer, settings, stats } = state;
  const remaining = timer.endsAt != null ? Math.max(0, timer.endsAt - now) : timer.remaining;
  return {
    mode: timer.mode,
    round: timer.round,
    rounds: settings.rounds,
    settings,
    running,
    remaining,
    progress: 1 - remaining / durationOf(settings, timer.mode),
    doneToday: stats.day === today() ? stats.done : 0,
    ...actions,
  };
}
