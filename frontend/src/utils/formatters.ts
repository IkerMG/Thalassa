import { format, parseISO, subDays, subMonths } from 'date-fns';

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy');
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, HH:mm');
}

export function formatChartDate(iso: string): string {
  return format(parseISO(iso), 'MM/dd');
}

export type TimeRange = '7d' | '30d' | '3m' | 'all';

export function filterByTimeRange<T extends { measuredAt: string }>(
  items: T[],
  range: TimeRange
): T[] {
  if (range === 'all') return items;
  const now = new Date();
  const cutoff =
    range === '7d' ? subDays(now, 7) :
    range === '30d' ? subDays(now, 30) :
    subMonths(now, 3);
  return items.filter((item) => parseISO(item.measuredAt) >= cutoff);
}
