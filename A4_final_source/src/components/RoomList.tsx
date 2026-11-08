import { formatRange } from '../lib/timeUtils';
import type { Room } from '../types';

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  showEmptyState: boolean;
}

export function RoomList({ rooms, selectedRoomId, onSelect, showEmptyState }: Props) {
  if (showEmptyState) {
    // F4: clear empty state when no rooms match
    return (
      <p role="status" className="rounded-lg border border-dashed border-gray-400 p-4 text-sm text-gray-700">
        No rooms match your requirements. Try fewer attendees or fewer equipment items.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rooms.map((room) => {
        const selected = room.id === selectedRoomId;
        return (
          <li key={room.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(room.id)}
              className={`w-full rounded-lg border-2 p-3 text-left ${
                selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="font-semibold">{room.name}</span>
                {room.blocked && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Blocked</span>
                )}
              </span>
              <span className="block text-sm text-gray-700">Capacity: {room.capacity}</span>
              <span className="block text-sm text-gray-700">{room.equipment.join(', ')}</span>
              <span className="block text-xs text-gray-600">
                Booked: {room.bookings.length === 0 ? 'none' : room.bookings.map(formatRange).join(', ')}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
