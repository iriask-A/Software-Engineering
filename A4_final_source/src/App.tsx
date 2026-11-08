import { useReducer } from 'react';
import { ROOMS } from './data/rooms';
import { NOW } from './lib/bookingConfig';
import { listEquipment } from './lib/roomFilter';
import { createInitialState, getVisibleRooms, reduce, type Action, type SearchState } from './lib/searchState';
import { findRoomById } from './lib/roomAvailability';
import { formatTime } from './lib/timeUtils';
import { AvailabilityForm } from './components/AvailabilityForm';
import { FilterPanel } from './components/FilterPanel';
import { ResultBanner } from './components/ResultBanner';
import { RoomList } from './components/RoomList';

const EQUIPMENT_OPTIONS = listEquipment(ROOMS);

export default function App() {
  const [state, dispatch] = useReducer(
    (current: SearchState, action: Action) => reduce(current, action),
    undefined,
    createInitialState,
  );
  const { rooms, attendeesError, isEmpty } = getVisibleRooms(state);
  const resultRoom = state.result ? findRoomById(ROOMS, state.result.roomId) : undefined;

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-bold">Smart Campus Room Availability Checker</h1>
        <p className="text-sm text-gray-600">Now: {formatTime(NOW)} (fixed for testing). Availability check only.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <FilterPanel
            attendeesText={state.attendeesText}
            attendeesError={attendeesError}
            equipmentOptions={EQUIPMENT_OPTIONS}
            selectedEquipment={state.equipment}
            onAttendeesChange={(text) => dispatch({ type: 'setAttendees', text })}
            onToggleEquipment={(item) => dispatch({ type: 'toggleEquipment', item })}
          />
          <RoomList
            rooms={rooms}
            selectedRoomId={state.selectedRoomId}
            showEmptyState={isEmpty}
            onSelect={(roomId) => dispatch({ type: 'selectRoom', roomId })}
          />
        </div>

        <div className="space-y-4">
          <AvailabilityForm
            startText={state.startText}
            endText={state.endText}
            onStartChange={(text) => dispatch({ type: 'setStart', text })}
            onEndChange={(text) => dispatch({ type: 'setEnd', text })}
            onCheck={() => dispatch({ type: 'check' })}
            onReset={() => dispatch({ type: 'reset' })}
          />
          {state.result && (
            <ResultBanner status={state.result.status} reason={state.result.reason} roomName={resultRoom?.name} />
          )}
        </div>
      </div>
    </main>
  );
}
