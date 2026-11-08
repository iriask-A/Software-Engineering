# AGENTS.md

## Project
Smart Campus Room Availability Checker (KBTU Software Engineering, Assignment #04).
User story: As a student, I want to find a room that fits my group and equipment and check whether it is free, so I can choose a valid booking time.
Scope: a small fictional catalog of at least 4 rooms, fixed current time (now = 540, i.e. 09:00), availability decision only.

## Structure
- src/data/rooms.ts - room catalog (data only)
- src/lib/bookingConfig.ts - constants (MAX_DURATION_MINUTES, END_OF_DAY, NOW)
- src/lib/checkAvailability.ts - booking rules AC1-AC5 (pure functions)
- src/lib/timeUtils.ts - HH:MM parsing and formatting
- src/lib/roomFilter.ts - capacity and equipment filtering
- src/lib/roomAvailability.ts - one room + the rules
- src/lib/searchState.ts - pure reducer for page state
- src/components/*.tsx and src/App.tsx - UI only
- src/**/*.test.ts(x) - Vitest tests

## Acceptance criteria (must stay true)
- AC1: reject start >= end and past requests (start must be after now); times within 0-1440.
- AC2: reject durations longer than 120 minutes (exactly 120 is allowed).
- AC3: reject a blocked room.
- AC4: reject overlaps; allow bookings that touch only at endpoints (half-open intervals).
- AC5: never mutate booking data.
- AC6: clear, responsive feedback (desktop and mobile).
- F1: room capacity >= requested attendees. F2: room contains ALL selected equipment.
- F3: a blocked room is never reported as available. F4: clear empty state when no rooms match.
- F5: changing the selected room refreshes the availability result.

## Constraints
- No backend, login, payments, live APIs, database or saved bookings. Fictional data only.
- Do not change the signature or the AC1-AC5 logic of checkAvailability(start, end, now, blocked, existing).
- Do not add dependencies. Do not weaken or delete existing test assertions.
- One change at a time; run the tests after each change.

## Engineering rules
- Prefer pure functions and the smallest change that solves the problem.
- Keep each rule in exactly one place (no duplicated validation or parsing).
- Do not use Singleton, Factory, Strategy, Adapter or class hierarchies without a concrete need.

## Commands
- Tests: npx vitest run
- Type check: npx tsc -b
- Build: npm run build
- Dev preview: npm run dev

## Reporting
- Report changed files, the reason for each, the exact test command and output, and remaining limitations.
- Never claim tests passed without running them. If something cannot be run, say so.
