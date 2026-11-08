// Mutation spot-check: break ONE rule at a time and confirm the test suite fails ("mutant killed").
// Usage: node scripts/mutation-check.mjs     (every file is restored afterwards)
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

const MUTANTS = [
  ['src/lib/checkAvailability.ts', 'end - start > MAX_DURATION_MINUTES', 'end - start >= MAX_DURATION_MINUTES', 'AC2: exactly 120 minutes wrongly rejected'],
  ['src/lib/checkAvailability.ts', 'start < bookedEnd && end > bookedStart', 'start <= bookedEnd && end >= bookedStart', 'AC4: touching intervals treated as overlap'],
  ['src/lib/checkAvailability.ts', 'if (start <= now)', 'if (start < now)', 'AC1: start == now accepted'],
  ['src/lib/roomFilter.ts', 'room.capacity >= attendees', 'room.capacity > attendees', 'F1: exact capacity rejected'],
  ['src/lib/roomFilter.ts', 'required.every(', 'required.some(', 'F2: ANY instead of ALL equipment'],
  ['src/lib/roomAvailability.ts', 'room.bookings)', '[[600, 660]])', 'Per-room data: another room\'s bookings used'],
  ['src/lib/roomAvailability.ts', 'room.blocked,', 'false,', 'F3: blocked room can be reported available'],
  ['src/lib/searchState.ts', 'state.result === null ? null : evaluate(next, ctx)', 'state.result', 'F5: result not refreshed on room change'],
];

function runTests() {
  try {
    execSync('npx vitest run', { stdio: 'pipe', encoding: 'utf8' });
    return { passed: true, failed: 0 };
  } catch (error) {
    const text = `${error.stdout ?? ''}${error.stderr ?? ''}`.replace(/\u001b\[[0-9;]*m/g, '');
    const match = text.match(/(\d+) failed/g);
    const last = match ? Number(match[match.length - 1].split(' ')[0]) : 1;
    return { passed: false, failed: last };
  }
}

let killed = 0;
console.log('ID  Result                Mutant');
MUTANTS.forEach(([file, original, mutated, description], index) => {
  copyFileSync(file, `${file}.bak`);
  try {
    const source = readFileSync(file, 'utf8');
    if (!source.includes(original)) throw new Error(`pattern not found in ${file}: ${original}`);
    writeFileSync(file, source.replace(original, mutated));
    const outcome = runTests();
    const label = outcome.passed ? 'SURVIVED' : `KILLED (${outcome.failed} failed)`;
    if (!outcome.passed) killed += 1;
    console.log(`M${index + 1}  ${label.padEnd(20)}  ${description}`);
  } finally {
    renameSync(`${file}.bak`, file);
  }
});
console.log(`Mutants killed: ${killed} / ${MUTANTS.length}`);
