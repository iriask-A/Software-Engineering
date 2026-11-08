// Regression tests for the ORIGINAL acceptance criteria AC1-AC5 (must still hold after the extension).
// Fixture identical to Practice #09: now = 540 (09:00), one booking 600-660 (10:00-11:00), not blocked.
import { describe, expect, it } from 'vitest';
import { checkAvailability } from './checkAvailability';
import { EXISTING_BOOKINGS, NOW } from './bookingConfig';
import type { Interval } from '../types';

const run = (start: number, end: number, blocked = false, existing: readonly Interval[] = EXISTING_BOOKINGS) =>
  checkAvailability(start, end, NOW, blocked, existing);

describe('AC1: valid time', () => {
  it('AC1-a rejects a request that starts exactly now (540-570)', () => {
    expect(run(540, 570).status).toBe('invalid');
  });
  it('AC1-b rejects a past request (480-540)', () => {
    expect(run(480, 540).status).toBe('invalid');
  });
  it('AC1-c accepts a request starting one minute after now (541-600)', () => {
    expect(run(541, 600).status).toBe('available');
  });
  it('AC1-d rejects reversed (700-650) and zero-length (700-700) requests', () => {
    expect(run(700, 650).status).toBe('invalid');
    expect(run(700, 700).status).toBe('invalid');
  });
  it('AC1-e accepts end = 1440 (23:00-24:00) and rejects end = 1441', () => {
    expect(run(1380, 1440).status).toBe('available');
    expect(run(1400, 1441).status).toBe('invalid');
  });
  it('AC1-f rejects a negative start', () => {
    expect(checkAvailability(-10, 30, 0, false, []).status).toBe('invalid');
  });
});

describe('AC2: 120-minute maximum (boundary 120 vs 121)', () => {
  it('AC2-a accepts exactly 120 minutes (700-820)', () => {
    expect(run(700, 820).status).toBe('available');
  });
  it('AC2-b rejects 121 minutes (700-821)', () => {
    expect(run(700, 821).status).toBe('invalid');
  });
});

describe('AC3: blocked room', () => {
  it('AC3-a never reports a blocked room as available', () => {
    expect(run(700, 760, true).status).toBe('unavailable');
  });
});

describe('AC4: overlap rules (touching vs overlapping)', () => {
  it('AC4-a rejects a partial overlap (630-690)', () => {
    expect(run(630, 690).status).toBe('unavailable');
  });
  it('AC4-b allows a request touching the end of a booking (660-720)', () => {
    expect(run(660, 720).status).toBe('available');
  });
  it('AC4-c allows a request touching the start of a booking (570-600)', () => {
    expect(run(570, 600).status).toBe('available');
  });
  it('AC4-d rejects a request inside a booking (610-640) and one enclosing it (590-670)', () => {
    expect(run(610, 640).status).toBe('unavailable');
    expect(run(590, 670).status).toBe('unavailable');
  });
});

describe('AC5: immutable booking data', () => {
  it('AC5-a leaves the bookings array deep-equal after every outcome', () => {
    const bookings: [number, number][] = [[600, 660], [720, 780]];
    const before = JSON.stringify(bookings);
    run(630, 690, false, bookings); // unavailable
    run(660, 720, false, bookings); // available
    run(700, 650, false, bookings); // invalid
    run(900, 960, true, bookings); // blocked
    expect(JSON.stringify(bookings)).toBe(before);
  });
  it('AC5-b works on a frozen array (would throw if the code tried to mutate it)', () => {
    const frozen = Object.freeze([Object.freeze([600, 660] as const)]);
    expect(() => run(630, 690, false, frozen)).not.toThrow();
  });
});
