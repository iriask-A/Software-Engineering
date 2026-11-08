import type { Interval } from '../types';

/**
 * Parse "HH:MM" into minutes after midnight.
 * Returns null only for malformed text or minutes > 59. The day-range rule
 * (0..1440, AC1) is NOT checked here: it lives in checkAvailability.validateRequest.
 */
export function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Format minutes after midnight as "HH:MM" (1440 -> "24:00"). */
export function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Format an interval as "HH:MM–HH:MM". */
export function formatRange([start, end]: Interval): string {
  return `${formatTime(start)}\u2013${formatTime(end)}`;
}
