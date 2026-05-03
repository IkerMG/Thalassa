import type { ParameterKey } from '../types/parameter';

export interface ParameterRangeInfo {
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
}

export const PARAMETER_RANGES: Record<ParameterKey, ParameterRangeInfo> = {
  temperature:   { label: 'Temperature',  unit: '°C',  min: 24.0,  max: 26.5,  decimals: 1 },
  salinity:      { label: 'Salinity',     unit: 'SG',  min: 1.023, max: 1.026, decimals: 3 },
  ph:            { label: 'pH',           unit: '',    min: 8.0,   max: 8.4,   decimals: 2 },
  alkalinityDKH: { label: 'Alkalinity',   unit: 'dKH', min: 7.0,   max: 11.0,  decimals: 1 },
  calciumPPM:    { label: 'Calcium',      unit: 'ppm', min: 380,   max: 450,   decimals: 0 },
  magnesiumPPM:  { label: 'Magnesium',    unit: 'ppm', min: 1250,  max: 1400,  decimals: 0 },
  nitratesPPM:   { label: 'Nitrates',     unit: 'ppm', min: 0,     max: 10,    decimals: 1 },
  phosphatesPPM: { label: 'Phosphates',   unit: 'ppm', min: 0.00,  max: 0.10,  decimals: 3 },
};

export const PARAMETER_KEYS: ParameterKey[] = [
  'temperature', 'salinity', 'ph', 'alkalinityDKH',
  'calciumPPM', 'magnesiumPPM', 'nitratesPPM', 'phosphatesPPM',
];

export type ParameterStatus = 'good' | 'warning' | 'danger' | 'unknown';

export function getParameterStatus(key: ParameterKey, value: number | null): ParameterStatus {
  if (value === null || value === undefined) return 'unknown';
  const r = PARAMETER_RANGES[key];
  const span = r.max - r.min;
  const buffer = span * 0.15;
  if (value >= r.min && value <= r.max) return 'good';
  if (value >= r.min - buffer && value <= r.max + buffer) return 'warning';
  return 'danger';
}

export function formatParamValue(key: ParameterKey, value: number | null): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(PARAMETER_RANGES[key].decimals);
}
