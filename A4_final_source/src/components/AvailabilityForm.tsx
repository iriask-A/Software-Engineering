interface Props {
  startText: string;
  endText: string;
  onStartChange: (text: string) => void;
  onEndChange: (text: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

export function AvailabilityForm({ startText, endText, onStartChange, onEndChange, onCheck, onReset }: Props) {
  return (
    <section aria-labelledby="check-heading" className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 id="check-heading" className="mb-3 text-lg font-semibold">Check a time slot</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="block text-sm font-medium">Start time</label>
          <input
            id="start"
            type="time"
            value={startText}
            onChange={(event) => onStartChange(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium">End time</label>
          <input
            id="end"
            type="text"
            inputMode="numeric"
            placeholder="HH:MM (24:00 allowed)"
            value={endText}
            onChange={(event) => onEndChange(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onCheck} className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
          Check availability
        </button>
        <button type="button" onClick={onReset} className="rounded border border-gray-300 px-4 py-2">
          Reset
        </button>
      </div>
    </section>
  );
}
