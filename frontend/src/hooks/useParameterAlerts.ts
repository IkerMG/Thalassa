import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WaterParameter } from '../types/parameter';
import type { NotificationItem } from '../api/notificationApi';
import { useAquariums } from './queries/useAquariums';
import { waterParametersQueryKey } from './queries/useWaterParameters';

// ── Threshold rules ───────────────────────────────────────────────────────────
// Based on standard reef aquarium safe ranges.

interface AlertRule {
  key: keyof WaterParameter;
  title: string;
  check: (v: number) => string | null;
}

const RULES: AlertRule[] = [
  {
    key: 'temperature',
    title: 'Temperatura',
    check: (v) => {
      if (v > 28) return `Temperatura crítica: ${v}°C (máx. recomendado 28°C)`;
      if (v > 27) return `Temperatura elevada: ${v}°C (rango ideal 24–26°C)`;
      if (v < 22) return `Temperatura crítica: ${v}°C (mín. recomendado 22°C)`;
      if (v < 23) return `Temperatura baja: ${v}°C (rango ideal 24–26°C)`;
      return null;
    },
  },
  {
    key: 'ph',
    title: 'pH',
    check: (v) => {
      if (v < 7.8) return `pH crítico: ${v} — actúa de inmediato (mín. 7.8)`;
      if (v < 8.1) return `pH bajo: ${v} (recomendado 8.1–8.4)`;
      return null;
    },
  },
  {
    key: 'alkalinityDKH',
    title: 'KH / Alcalinidad',
    check: (v) => {
      if (v < 6)  return `KH crítico: ${v} dKH (mín. 6 dKH)`;
      if (v < 7)  return `KH bajo: ${v} dKH (recomendado 7–11 dKH)`;
      if (v > 12) return `KH crítico: ${v} dKH (máx. 12 dKH)`;
      if (v > 11) return `KH elevado: ${v} dKH (recomendado 7–11 dKH)`;
      return null;
    },
  },
  {
    key: 'nitratesPPM',
    title: 'Nitratos',
    check: (v) => {
      if (v > 25) return `Nitratos críticos: ${v} ppm (máx. recomendado 25 ppm)`;
      if (v > 10) return `Nitratos elevados: ${v} ppm (recomendado < 10 ppm)`;
      return null;
    },
  },
  {
    key: 'phosphatesPPM',
    title: 'Fosfatos',
    check: (v) => {
      if (v > 0.25) return `Fosfatos críticos: ${v} ppm (máx. recomendado 0.25 ppm)`;
      if (v > 0.1)  return `Fosfatos elevados: ${v} ppm (recomendado < 0.1 ppm)`;
      return null;
    },
  },
];

// ── Hook ──────────────────────────────────────────────────────────────────────
// Reads only from the React Query cache — no extra API calls.
// Alerts appear once the user has visited an aquarium's detail page in this session.

export function useParameterAlerts(): NotificationItem[] {
  const queryClient = useQueryClient();
  const { data: aquariums = [] } = useAquariums();

  return useMemo(() => {
    const alerts: NotificationItem[] = [];
    let id = -1;

    for (const aq of aquariums) {
      const params = queryClient.getQueryData<WaterParameter[]>(
        waterParametersQueryKey(aq.id)
      );
      if (!params || params.length === 0) continue;

      const latest = params[0]; // backend returns newest first

      for (const rule of RULES) {
        const value = latest[rule.key] as number | null;
        if (value == null) continue;
        const msg = rule.check(value);
        if (!msg) continue;

        alerts.push({
          id: id--,
          title: `${rule.title} — ${aq.name}`,
          message: msg,
          type: 'WARNING',
          read: false,
          createdAt: latest.measuredAt,
        });
      }
    }

    return alerts;
  }, [aquariums, queryClient]);
}
