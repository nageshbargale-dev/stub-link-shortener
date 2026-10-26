import { useMemo } from 'react';
import { hashOf } from '../lib/util.js';

// A barcode that is unique (and stable) per short code. Purely decorative.
export function Barcode({ code }) {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0, seed = hashOf(code); i < 44; i++) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      out.push([1 + ((seed >>> 16) % 3), 1 + ((seed >>> 20) % 2)]);
    }
    return out;
  }, [code]);

  return (
    <div className="barcode" aria-hidden="true">
      {bars.map(([w, gap], i) => (
        <i key={i} style={{ width: w, marginRight: gap }} />
      ))}
    </div>
  );
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Clicks per day for the last week, labelled, with today on the right.
export function WeekChart({ data = [] }) {
  const max = Math.max(1, ...data);
  const today = new Date().getDay();
  return (
    <ol className="week" aria-label={`Clicks over the last 7 days: ${data.join(', ')}`}>
      {data.map((v, i) => (
        <li key={i} className={i === 6 ? 'is-today' : ''}>
          <span className="week-n">{v || ''}</span>
          <span className="week-bar" style={{ height: `${Math.max(4, (v / max) * 100)}%` }} />
          <span className="week-day">{DAY_LETTERS[(today + i + 1) % 7]}</span>
        </li>
      ))}
    </ol>
  );
}
