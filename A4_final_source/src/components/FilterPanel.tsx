interface Props {
  attendeesText: string;
  attendeesError: string | null;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onAttendeesChange: (text: string) => void;
  onToggleEquipment: (item: string) => void;
}

export function FilterPanel({
  attendeesText,
  attendeesError,
  equipmentOptions,
  selectedEquipment,
  onAttendeesChange,
  onToggleEquipment,
}: Props) {
  return (
    <section aria-labelledby="filters-heading" className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 id="filters-heading" className="mb-3 text-lg font-semibold">Requirements</h2>

      <label htmlFor="attendees" className="block text-sm font-medium">Attendees</label>
      <input
        id="attendees"
        type="text"
        inputMode="numeric"
        placeholder="e.g. 12"
        value={attendeesText}
        onChange={(event) => onAttendeesChange(event.target.value)}
        aria-invalid={attendeesError !== null}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
      />
      {attendeesError && <p className="mt-1 text-sm text-red-700">{attendeesError}</p>}

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Required equipment (all selected items)</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {equipmentOptions.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedEquipment.includes(item)}
                onChange={() => onToggleEquipment(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
