// UI smoke check: render the real <App /> to HTML (react-dom/server, no extra dependencies).
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from './App';
import { ROOMS } from './data/rooms';

describe('UI: <App /> initial render', () => {
  // react-dom/server puts <!-- --> markers between text and {expressions}; strip them before matching text.
  const html = renderToString(<App />).replace(/<!-- -->/g, '');

  it('shows every room of the catalog', () => {
    for (const room of ROOMS) expect(html).toContain(room.name);
  });
  it('shows the fixed current time, the filters and the check button', () => {
    expect(html).toContain('Now: 09:00');
    expect(html).toContain('Required equipment');
    expect(html).toContain('Check availability');
  });
  it('shows the blocked badge for the blocked room and no empty state or result at start', () => {
    expect(html).toContain('Blocked');
    expect(html).not.toContain('No rooms match');
    expect(html).not.toContain('Invalid input');
  });
});
