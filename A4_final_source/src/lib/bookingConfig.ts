import { ROOMS } from '../data/rooms';

// Single source of truth for the booking constants.
export const MAX_DURATION_MINUTES = 120;
export const END_OF_DAY = 1440;
export const NOW = 540; // fixed "current time" 09:00 (minutes after midnight)

// Kept for the original Practice #09 test file: the single-room fixture is now
// the first room of the catalog, so the data exists in exactly one place.
export const EXISTING_BOOKINGS = ROOMS[0].bookings;
