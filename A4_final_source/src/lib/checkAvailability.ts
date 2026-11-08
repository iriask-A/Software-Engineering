// Booking/availability rules (AC1-AC5). Pure functions: no UI, no side effects.
import { END_OF_DAY, MAX_DURATION_MINUTES } from './bookingConfig';
import { formatRange, formatTime } from './timeUtils';
import type { AvailabilityResult, Interval } from '../types';

function invalid(reason: string): AvailabilityResult {
  return { status: 'invalid', reason };
}

/** AC1 + AC2: returns an 'invalid' result, or null when the request is well-formed. */
export function validateRequest(start: number, end: number, now: number): AvailabilityResult | null {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return invalid('Enter a valid start and end time.');
  }
  if (start < 0 || end > END_OF_DAY) {
    return invalid(`Times must be between ${formatTime(0)} and ${formatTime(END_OF_DAY)}.`);
  }
  if (start >= end) {
    return invalid('End time must be after the start time.');
  }
  if (start <= now) {
    return invalid(`Start time must be strictly after the current time (${formatTime(now)}).`);
  }
  if (end - start > MAX_DURATION_MINUTES) {
    return invalid(`Duration cannot exceed ${MAX_DURATION_MINUTES} minutes.`);
  }
  return null;
}

/** AC4: first booking that overlaps [start, end); touching endpoints do not overlap. */
export function findOverlap(start: number, end: number, existing: readonly Interval[]): Interval | undefined {
  return existing.find(([bookedStart, bookedEnd]) => start < bookedEnd && end > bookedStart);
}

/** Availability decision for one room. Never mutates `existing` (AC5). */
export function checkAvailability(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Interval[],
): AvailabilityResult {
  const problem = validateRequest(start, end, now);
  if (problem) return problem;

  if (blocked) {
    return { status: 'unavailable', reason: 'Room is blocked by an administrator.' };
  }

  const conflict = findOverlap(start, end, existing);
  if (conflict) {
    return { status: 'unavailable', reason: `Overlaps with existing booking ${formatRange(conflict)}.` };
  }

  return { status: 'available', reason: 'No conflicts \u2014 the room is free for this time slot.' };
}
