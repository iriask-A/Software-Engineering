// Counts independent implementations of each rule in NON-test source files.
// Usage: node scripts/duplication-check.mjs [srcDir]     (default: src)
// A rule is "single-sourced" when it has exactly 1 match; every extra match is a duplicated location.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'src';

const RULES = [
  ['HH:MM parsing', /\.split\(\s*['"]:['"]\s*\)|\\d\{1,2\}\)?:\(?\\d\{2\}/],
  ['HH:MM formatting', /padStart\(/],
  ['120-minute limit check', /[>]=?\s*(MAX_DURATION_MINUTES|120)\b/],
  ['End-of-day (1440) check', /[>]=?\s*(END_OF_DAY|1440)\b/],
  ['Overlap predicate', /\w+\s*<\s*\w+\s*&&\s*\w+\s*>\s*\w+/],
];

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const files = sourceFiles(root);
console.log(`Scanned ${files.length} non-test source files under ${root}/\n`);
let total = 0;
for (const [label, pattern] of RULES) {
  const hits = [];
  for (const file of files) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const code = line.trim();
      if (code.startsWith('//') || code.startsWith('*') || code.startsWith('import ')) return;
      if (pattern.test(line)) hits.push(`${file}:${i + 1}`);
    });
  }
  total += hits.length;
  console.log(`${label.padEnd(26)} ${hits.length}   ${hits.join(', ') || '-'}`);
}
console.log(`\nTotal rule implementations: ${total} (ideal for ${RULES.length} rules = ${RULES.length})`);
