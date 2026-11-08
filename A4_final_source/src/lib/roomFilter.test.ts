// Tests for F1 (capacity) and F2 (equipment) filtering.
import { describe, expect, it } from 'vitest';
import { ROOMS } from '../data/rooms';
import { filterRooms, listEquipment, parseAttendees } from './roomFilter';

const ids = (rooms: { id: string }[]) => rooms.map((room) => room.id);

describe('F1: capacity filter (room capacity >= attendees)', () => {
  it('F1-a keeps a room whose capacity equals the attendees (exact capacity: 12 -> B-204)', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 12, equipment: [] }))).toContain('B-204');
  });
  it('F1-b drops a room with insufficient capacity (13 -> B-204 excluded)', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 13, equipment: [] }))).not.toContain('B-204');
  });
  it('F1-c with 13 attendees returns exactly A-101, C-310 and D-001', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 13, equipment: [] }))).toEqual(['A-101', 'C-310', 'D-001']);
  });
  it('F1-d null attendees applies no capacity filter', () => {
    expect(filterRooms(ROOMS, { attendees: null, equipment: [] })).toHaveLength(ROOMS.length);
  });
});

describe('F2: equipment filter (room must contain ALL selected items)', () => {
  it('F2-a one item: Video conferencing -> B-204 and D-001', () => {
    expect(ids(filterRooms(ROOMS, { attendees: null, equipment: ['Video conferencing'] }))).toEqual(['B-204', 'D-001']);
  });
  it('F2-b two items must BOTH be present: Projector + Video conferencing -> D-001 only', () => {
    expect(ids(filterRooms(ROOMS, { attendees: null, equipment: ['Projector', 'Video conferencing'] }))).toEqual(['D-001']);
  });
  it('F2-c an item no room has returns an empty list', () => {
    expect(filterRooms(ROOMS, { attendees: null, equipment: ['3D printer'] })).toEqual([]);
  });
  it('F2-d capacity and equipment combine: 30 attendees + Projector -> A-101 and D-001', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 30, equipment: ['Projector'] }))).toEqual(['A-101', 'D-001']);
  });
});

describe('filter helpers', () => {
  it('does not mutate the catalog', () => {
    const before = JSON.stringify(ROOMS);
    filterRooms(ROOMS, { attendees: 20, equipment: ['Projector'] });
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
  it('parseAttendees: empty = no filter; whole numbers >= 1 are valid; others give an error', () => {
    expect(parseAttendees('')).toEqual({ value: null, error: null });
    expect(parseAttendees(' 12 ')).toEqual({ value: 12, error: null });
    for (const bad of ['0', '-3', '2.5', 'abc']) {
      expect(parseAttendees(bad).error).not.toBeNull();
    }
  });
  it('listEquipment returns the distinct sorted equipment names', () => {
    expect(listEquipment(ROOMS)).toEqual(['Computers', 'Power outlets', 'Projector', 'Video conferencing', 'Whiteboard']);
  });
});
