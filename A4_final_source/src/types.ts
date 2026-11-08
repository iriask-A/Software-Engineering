// Shared types for the Smart Campus Room Availability Checker.

/** A booking interval in minutes after midnight, half-open: [start, end). */
export type Interval = readonly [start: number, end: number];

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Interval[];
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'invalid';

export interface AvailabilityResult {
  status: AvailabilityStatus;
  reason: string;
}

export interface RoomFilters {
  /** Requested attendees; null means "no capacity requirement". */
  attendees: number | null;
  /** Required equipment; a room must contain ALL of these items. */
  equipment: string[];
}
