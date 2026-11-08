import type { AvailabilityStatus } from '../types';

// One lookup table replaces three copy-pasted result blocks.
const BANNER: Record<AvailabilityStatus, { title: string; classes: string }> = {
  available: { title: 'Available', classes: 'border-green-600 bg-green-50 text-green-900' },
  unavailable: { title: 'Unavailable', classes: 'border-red-600 bg-red-50 text-red-900' },
  invalid: { title: 'Invalid input', classes: 'border-amber-600 bg-amber-50 text-amber-900' },
};

interface Props {
  status: AvailabilityStatus;
  reason: string;
  roomName?: string;
}

export function ResultBanner({ status, reason, roomName }: Props) {
  const { title, classes } = BANNER[status];
  return (
    <div role="status" aria-live="polite" className={`rounded-lg border-2 p-4 ${classes}`}>
      <p className="text-2xl font-bold">{title}</p>
      {roomName && <p className="text-sm font-medium">{roomName}</p>}
      <p className="mt-1 text-sm">{reason}</p>
    </div>
  );
}
