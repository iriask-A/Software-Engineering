// Room filtering (F1, F2). Pure functions; the catalog is never modified.
import type { Room, RoomFilters } from '../types';

/** F1: room capacity must be >= requested attendees (null = no requirement). */
export function meetsCapacity(room: Room, attendees: number | null): boolean {
  return attendees === null || room.capacity >= attendees;
}

/** F2: the room must contain ALL required items. */
export function hasAllEquipment(room: Room, required: readonly string[]): boolean {
  return required.every((item) => room.equipment.includes(item));
}

export function filterRooms(rooms: readonly Room[], filters: RoomFilters): Room[] {
  return rooms.filter(
    (room) => meetsCapacity(room, filters.attendees) && hasAllEquipment(room, filters.equipment),
  );
}

/** Parse the attendees text box: '' = no filter, otherwise a whole number >= 1. */
export function parseAttendees(text: string): { value: number | null; error: string | null } {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null, error: null };
  if (!/^\d+$/.test(trimmed) || Number(trimmed) < 1) {
    return { value: null, error: 'Attendees must be a whole number of at least 1.' };
  }
  return { value: Number(trimmed), error: null };
}

/** Distinct equipment names in the catalog, sorted, for the filter checkboxes. */
export function listEquipment(rooms: readonly Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort();
}
