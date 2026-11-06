import { useCallback, useEffect, useState } from 'react';

import { HEALTH_INTERVAL_MS, SERVICES, SLOW_MS } from '../config';
import { useAppActive } from '../hooks';
import { usePager } from '../pager/context';

export type ServiceStatus = 'ok' | 'slow' | 'down' | 'pending';
export type ServiceResult = { name: string; status: ServiceStatus; ms: number | null; detail?: string };

const TIMEOUT_MS = 6000;

async function check(url: string): Promise<Omit<ServiceResult, 'name'>> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    const ms = Date.now() - started;
    if (!res.ok) return { status: 'down', ms, detail: `HTTP ${res.status}` };
    return { status: ms >= SLOW_MS ? 'slow' : 'ok', ms };
  } catch {
    return { status: 'down', ms: null, detail: controller.signal.aborted ? 'TIMEOUT' : 'UNREACHABLE' };
  } finally {
    clearTimeout(timer);
  }
}

// Pings SERVICES while this page is on screen and the app is in front.
export function useHealth() {
  const { index, current } = usePager();
  const active = useAppActive();
  const visible = active && index === current;

  const [results, setResults] = useState<ServiceResult[]>(() =>
    SERVICES.map((s) => ({ name: s.name, status: 'pending', ms: null })),
  );
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const run = useCallback(async () => {
    setChecking(true);
    const out = await Promise.all(SERVICES.map(async (s) => ({ name: s.name, ...(await check(s.url)) })));
    setResults(out);
    setCheckedAt(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const first = setTimeout(run, 0);
    const id = setInterval(run, HEALTH_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [visible, run]);

  const online = results.filter((r) => r.status === 'ok' || r.status === 'slow').length;
  const degraded = results.filter((r) => r.status === 'slow').length;
  const down = results.filter((r) => r.status === 'down').length;
  const headline = !checkedAt ? 'CHECKING' : down > 0 ? (online === 0 ? 'OUTAGE' : 'PARTIAL OUTAGE') : degraded > 0 ? 'DEGRADED' : 'OPERATIONAL';

  return { results, online, degraded, down, total: results.length, headline, checkedAt, checking, refresh: run };
}

export const hhmm = (d: Date | null) =>
  d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '--:--';
