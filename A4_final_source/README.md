# Smart Campus Room Availability Checker (Assignment #04 final version)

KBTU Software Engineering, Assignment #04 - Askarbekova Ingkar (24B031655).
Fictional data only. No login, payments, live APIs or database. The page only checks availability; it never creates a booking.

## Features
- Catalog of 5 fictional rooms (ID, name, capacity, equipment, blocked status, own bookings) in `src/data/rooms.ts`.
- Filters: attendees (capacity >= attendees) and required equipment (room must have ALL selected items).
- Pick a room, enter start/end time (HH:MM, end may be 24:00) and check availability against THAT room's bookings.
- Original rules AC1-AC6 are preserved (fixed current time 09:00, max 120 minutes, blocked room, half-open overlap, no mutation, clear responsive feedback).

## Setup, run, test
```bash
npm install                 # install dependencies
npm run dev                 # start the dev server (Bolt: preview opens automatically)
npx vitest run              # run ALL automated tests (same as: npm test)
npx tsc -b                  # type check
npm run build               # type check + production build
node scripts/duplication-check.mjs src   # count implementations of each rule (duplication measure)
node scripts/mutation-check.mjs          # break 8 rules one by one; the tests must fail each time
```
Expected final result of `npx vitest run` for the new suite: `Test Files 6 passed (6)`, `Tests 57 passed (57)`.
If the original Practice #09 test file `src/lib/checkAvailability.test.ts` is kept, it runs in the same command.

## Structure
| Path | Responsibility |
|---|---|
| `src/data/rooms.ts` | Room catalog (data only) |
| `src/lib/bookingConfig.ts` | Constants: `MAX_DURATION_MINUTES`, `END_OF_DAY`, `NOW`; `EXISTING_BOOKINGS` = A-101 bookings |
| `src/lib/checkAvailability.ts` | Booking rules AC1-AC5 (pure): `validateRequest`, `findOverlap`, `checkAvailability` |
| `src/lib/timeUtils.ts` | `parseTime`, `formatTime`, `formatRange` (no booking rules) |
| `src/lib/roomFilter.ts` | F1/F2 filtering, attendees parsing, equipment list |
| `src/lib/roomAvailability.ts` | `checkRoom(room, ...)`: binds one room's own bookings and blocked flag to the rules |
| `src/lib/searchState.ts` | Pure reducer for the page state (F4 empty state, F5 refresh on room change) |
| `src/components/*.tsx`, `src/App.tsx` | UI presentation only |
| `src/**/*.test.ts(x)` | Vitest tests (6 files, 57 tests) |
| `scripts/` | `duplication-check.mjs`, `mutation-check.mjs` |

## Tests
| File | Tests | Covers |
|---|---|---|
| `src/lib/ac-regression.test.ts` | 15 | AC1-AC5 regression, 120 vs 121, touching vs overlapping, no mutation |
| `src/lib/roomFilter.test.ts` | 11 | F1, F2, exact vs insufficient capacity, attendees parsing |
| `src/lib/roomAvailability.test.ts` | 7 | catalog integrity, per-room bookings, F3 blocked room |
| `src/lib/searchState.test.ts` | 17 | integration flow, F4 empty state, F5 room switching, validation |
| `src/lib/timeUtils.test.ts` | 4 | HH:MM parsing and formatting |
| `src/App.render.test.tsx` | 3 | UI smoke check: renders the real `<App />` to HTML |

Known limitation: layout and responsiveness (AC6) are checked visually (desktop and ~390 px); there is no DOM click-through test because no new dependencies are allowed.
