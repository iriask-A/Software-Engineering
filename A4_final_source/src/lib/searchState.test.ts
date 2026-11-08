// Integration / UI-behavior checks: the reducer is the exact state logic the page uses (F4, F5).
import { describe, expect, it } from 'vitest';
import { createInitialState, evaluate, getVisibleRooms, reduce, type Action, type SearchState } from './searchState';

const play = (...actions: Action[]): SearchState => actions.reduce((state, action) => reduce(state, action), createInitialState());
const ids = (state: SearchState) => getVisibleRooms(state).rooms.map((room) => room.id);

describe('integration: filter -> select -> check', () => {
  it('INT-1 initially lists the whole catalog with no empty state', () => {
    const view = getVisibleRooms(createInitialState());
    expect(view.rooms).toHaveLength(5);
    expect(view.isEmpty).toBe(false);
  });

  it('INT-2 successful filtering: 12 attendees + Whiteboard + Video conferencing -> B-204 and D-001', () => {
    const state = play(
      { type: 'setAttendees', text: '12' },
      { type: 'toggleEquipment', item: 'Whiteboard' },
      { type: 'toggleEquipment', item: 'Video conferencing' },
    );
    expect(ids(state)).toEqual(['B-204', 'D-001']);
  });

  it('INT-3 full flow: select A-101, 10:30-11:30 -> unavailable (overlaps 10:00-11:00)', () => {
    const state = play(
      { type: 'selectRoom', roomId: 'A-101' },
      { type: 'setStart', text: '10:30' },
      { type: 'setEnd', text: '11:30' },
      { type: 'check' },
    );
    expect(state.result).toMatchObject({ roomId: 'A-101', status: 'unavailable' });
  });

  it('INT-4 touching slot 11:00-12:00 in A-101 is available', () => {
    const state = play(
      { type: 'selectRoom', roomId: 'A-101' },
      { type: 'setStart', text: '11:00' },
      { type: 'setEnd', text: '12:00' },
      { type: 'check' },
    );
    expect(state.result?.status).toBe('available');
  });

  it('INT-5 end time 24:00 is accepted through the whole flow', () => {
    const state = play(
      { type: 'selectRoom', roomId: 'D-001' },
      { type: 'setStart', text: '23:00' },
      { type: 'setEnd', text: '24:00' },
      { type: 'check' },
    );
    expect(state.result?.status).toBe('available');
  });
});

describe('integration: out-of-range times', () => {
  it('INT-6 end time 25:00 gets the AC1 range message from the rules module', () => {
    const state = play(
      { type: 'selectRoom', roomId: 'A-101' },
      { type: 'setStart', text: '23:00' },
      { type: 'setEnd', text: '25:00' },
      { type: 'check' },
    );
    expect(state.result).toMatchObject({ status: 'invalid', reason: 'Times must be between 00:00 and 24:00.' });
  });
});

describe('F4: empty state when no rooms match', () => {
  it('F4-a 500 attendees matches no room -> empty state', () => {
    const view = getVisibleRooms(play({ type: 'setAttendees', text: '500' }));
    expect(view.rooms).toEqual([]);
    expect(view.isEmpty).toBe(true);
  });
  it('F4-b contradictory equipment (Computers + Video conferencing) -> empty state', () => {
    const state = play(
      { type: 'toggleEquipment', item: 'Computers' },
      { type: 'toggleEquipment', item: 'Video conferencing' },
    );
    expect(getVisibleRooms(state).isEmpty).toBe(true);
  });
  it('F4-c invalid attendees text shows a validation error instead of the empty state', () => {
    const view = getVisibleRooms(play({ type: 'setAttendees', text: 'abc' }));
    expect(view.attendeesError).not.toBeNull();
    expect(view.isEmpty).toBe(false);
  });
});

describe('F5: changing the selected room refreshes the availability result', () => {
  const checkedInA101 = play(
    { type: 'selectRoom', roomId: 'A-101' },
    { type: 'setStart', text: '10:30' },
    { type: 'setEnd', text: '11:30' },
    { type: 'check' },
  );

  it('F5-a switching A-101 -> E-215 recomputes the result for the same times (unavailable -> available)', () => {
    expect(checkedInA101.result?.status).toBe('unavailable');
    const switched = reduce(checkedInA101, { type: 'selectRoom', roomId: 'E-215' });
    expect(switched.result).toMatchObject({ roomId: 'E-215', status: 'available' });
  });
  it('F5-b switching to the blocked room C-310 gives unavailable', () => {
    const switched = reduce(checkedInA101, { type: 'selectRoom', roomId: 'C-310' });
    expect(switched.result).toMatchObject({ roomId: 'C-310', status: 'unavailable' });
  });
  it('F5-c switching before any check does not invent a result', () => {
    const state = play({ type: 'selectRoom', roomId: 'A-101' }, { type: 'selectRoom', roomId: 'B-204' });
    expect(state.result).toBeNull();
  });
  it('F5-d a filter that hides the selected room clears the selection and its result', () => {
    const hidden = reduce(checkedInA101, { type: 'setAttendees', text: '100' }); // only D-001 remains
    expect(hidden.selectedRoomId).toBeNull();
    expect(hidden.result).toBeNull();
  });
  it('F5-e a room hidden by the filters cannot be selected', () => {
    const state = play({ type: 'setAttendees', text: '100' }, { type: 'selectRoom', roomId: 'E-215' });
    expect(state.selectedRoomId).toBeNull();
  });
});

describe('validation feedback and reset', () => {
  it('asks for a room when none is selected', () => {
    expect(evaluate(createInitialState())).toMatchObject({ status: 'invalid', reason: 'Select a room first.' });
  });
  it('asks for HH:MM times when a field is empty', () => {
    const state = play({ type: 'selectRoom', roomId: 'A-101' }, { type: 'setStart', text: '10:00' }, { type: 'check' });
    expect(state.result).toMatchObject({ status: 'invalid', reason: 'Enter start and end times as HH:MM.' });
  });
  it('editing a time clears the stale result, and reset restores the initial state', () => {
    const edited = reduce(
      play({ type: 'selectRoom', roomId: 'A-101' }, { type: 'setStart', text: '10:30' }, { type: 'setEnd', text: '11:30' }, { type: 'check' }),
      { type: 'setEnd', text: '11:45' },
    );
    expect(edited.result).toBeNull();
    expect(reduce(edited, { type: 'reset' })).toEqual(createInitialState());
  });
});
