// Binds ONE chosen room to the booking rules, so a check can only ever use
// that room's own bookings and blocked status.
import { checkAvailability } from './checkAvailability';
import type { AvailabilityResult, Room } from '../types';

export function checkRoom(room: Room, start: number, end: number, now: number): AvailabilityResult {
  return checkAvailability(start, end, now, room.blocked, room.bookings);
}

export function findRoomById(rooms: readonly Room[], id: string | null): Room | undefined {
  return id === null ? undefined : rooms.find((room) => room.id === id);
}
