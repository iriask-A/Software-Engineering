// F3 (blocked room) and "availability uses the chosen room's own bookings".
import { describe, expect, it } from 'vitest';
import { ROOMS } from '../data/rooms';
import { NOW } from './bookingConfig';
import { checkRoom, findRoomById } from './roomAvailability';

const room = (id: string) => {
  const found = findRoomById(ROOMS, id);
  if (!found) throw new Error(`missing room ${id}`);
  return found;
};

describe('catalog integrity', () => {
  it('has at least four rooms with unique ids and all required fields', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ROOMS.map((r) => r.id)).size).toBe(ROOMS.length);
    for (const r of ROOMS) {
      expect(r.name).not.toBe('');
      expect(r.capacity).toBeGreaterThan(0);
      expect(r.equipment.length).toBeGreaterThan(0);
      expect(typeof r.blocked).toBe('boolean');
      for (const [start, end] of r.bookings) expect(start).toBeLessThan(end);
    }
  });
});

describe('per-room bookings', () => {
  it('the same slot (10:30-11:30) is unavailable in A-101 but available in E-215', () => {
    expect(checkRoom(room('A-101'), 630, 690, NOW).status).toBe('unavailable');
    expect(checkRoom(room('E-215'), 630, 690, NOW).status).toBe('available');
  });
  it('the reason names the booking of the chosen room (B-204: 09:30-10:30)', () => {
    const result = checkRoom(room('B-204'), 600, 660, NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('09:30\u201310:30');
  });
  it('touching intervals stay available in a non-first room (B-204 10:30-11:30)', () => {
    expect(checkRoom(room('B-204'), 630, 690, NOW).status).toBe('available');
  });
  it('original validation still applies per room (121 minutes -> invalid)', () => {
    expect(checkRoom(room('D-001'), 720, 841, NOW).status).toBe('invalid');
  });
});

describe('F3: a blocked room cannot be reported as available', () => {
  it('C-310 is unavailable even for a slot with no bookings (14:00-15:00)', () => {
    const result = checkRoom(room('C-310'), 840, 900, NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('blocked');
  });
  it('C-310 is never available for any 30-minute slot of the day after now', () => {
    for (let start = NOW + 1; start + 30 <= 1440; start += 30) {
      expect(checkRoom(room('C-310'), start, start + 30, NOW).status).not.toBe('available');
    }
  });
});
