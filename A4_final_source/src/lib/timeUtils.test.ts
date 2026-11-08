import { describe, expect, it } from 'vitest';
import { formatRange, formatTime, parseTime } from './timeUtils';

describe('parseTime / formatTime', () => {
  it('parses valid HH:MM values', () => {
    expect(parseTime('09:00')).toBe(540);
    expect(parseTime('9:05')).toBe(545);
    expect(parseTime('00:00')).toBe(0);
  });
  it('parses 24:00 as 1440; the day-range rule is enforced by checkAvailability, not here', () => {
    expect(parseTime('24:00')).toBe(1440);
    expect(parseTime('25:00')).toBe(1500);
  });
  it('rejects malformed text and minutes above 59', () => {
    expect(parseTime('')).toBeNull();
    expect(parseTime('abc')).toBeNull();
    expect(parseTime('10:60')).toBeNull();
    expect(parseTime('1000')).toBeNull();
  });
  it('formats minutes back to HH:MM and ranges with an en dash', () => {
    expect(formatTime(540)).toBe('09:00');
    expect(formatTime(1440)).toBe('24:00');
    expect(formatRange([600, 660])).toBe('10:00\u201311:00');
  });
});
