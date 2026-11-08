// UI state logic as a pure reducer, so UI behavior (F4, F5) is testable without a DOM.
import { ROOMS } from '../data/rooms';
import { NOW } from './bookingConfig';
import { filterRooms, parseAttendees } from './roomFilter';
import { checkRoom, findRoomById } from './roomAvailability';
import { parseTime } from './timeUtils';
import type { AvailabilityResult, Room } from '../types';

export interface RoomResult extends AvailabilityResult {
  roomId: string | null;
}

export interface SearchState {
  attendeesText: string;
  equipment: string[];
  selectedRoomId: string | null;
  startText: string;
  endText: string;
  result: RoomResult | null;
}

export type Action =
  | { type: 'setAttendees'; text: string }
  | { type: 'toggleEquipment'; item: string }
  | { type: 'selectRoom'; roomId: string }
  | { type: 'setStart'; text: string }
  | { type: 'setEnd'; text: string }
  | { type: 'check' }
  | { type: 'reset' };

export interface Context {
  rooms: readonly Room[];
  now: number;
}

export const defaultContext: Context = { rooms: ROOMS, now: NOW };

export function createInitialState(): SearchState {
  return { attendeesText: '', equipment: [], selectedRoomId: null, startText: '', endText: '', result: null };
}

/** Rooms that satisfy the current filters, plus attendees validation (F1, F2, F4). */
export function getVisibleRooms(state: SearchState, ctx: Context = defaultContext) {
  const attendees = parseAttendees(state.attendeesText);
  if (attendees.error) {
    return { rooms: [] as Room[], attendeesError: attendees.error, isEmpty: false };
  }
  const rooms = filterRooms(ctx.rooms, { attendees: attendees.value, equipment: state.equipment });
  return { rooms, attendeesError: null, isEmpty: rooms.length === 0 };
}

/** Availability result for the selected room and the typed times. */
export function evaluate(state: SearchState, ctx: Context = defaultContext): RoomResult {
  const room = findRoomById(ctx.rooms, state.selectedRoomId);
  if (!room) return { roomId: null, status: 'invalid', reason: 'Select a room first.' };

  const start = parseTime(state.startText);
  const end = parseTime(state.endText);
  if (start === null || end === null) {
    return { roomId: room.id, status: 'invalid', reason: 'Enter start and end times as HH:MM.' };
  }
  return { roomId: room.id, ...checkRoom(room, start, end, ctx.now) };
}

/** After a filter change, drop the selection (and its result) if the room is no longer listed. */
function reconcile(state: SearchState, ctx: Context): SearchState {
  const visible = getVisibleRooms(state, ctx).rooms;
  if (state.selectedRoomId !== null && !visible.some((room) => room.id === state.selectedRoomId)) {
    return { ...state, selectedRoomId: null, result: null };
  }
  return state;
}

export function reduce(state: SearchState, action: Action, ctx: Context = defaultContext): SearchState {
  switch (action.type) {
    case 'setAttendees':
      return reconcile({ ...state, attendeesText: action.text }, ctx);
    case 'toggleEquipment': {
      const equipment = state.equipment.includes(action.item)
        ? state.equipment.filter((item) => item !== action.item)
        : [...state.equipment, action.item];
      return reconcile({ ...state, equipment }, ctx);
    }
    case 'selectRoom': {
      if (!getVisibleRooms(state, ctx).rooms.some((room) => room.id === action.roomId)) return state;
      const next = { ...state, selectedRoomId: action.roomId };
      // F5: if a result is already showing, refresh it for the newly selected room.
      return { ...next, result: state.result === null ? null : evaluate(next, ctx) };
    }
    case 'setStart':
      return { ...state, startText: action.text, result: null };
    case 'setEnd':
      return { ...state, endText: action.text, result: null };
    case 'check':
      return { ...state, result: evaluate(state, ctx) };
    case 'reset':
      return createInitialState();
  }
}
