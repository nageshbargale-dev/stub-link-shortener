const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Each digit is a 0–9 strip that rolls to its value, like a mechanical counter.
export default function Odometer({ value = 0, digits = 4 }) {
  const str = String(Math.max(0, value)).padStart(digits, '0');
  return (
    <span className="odo" role="img" aria-label={String(value)}>
      {[...str].map((d, i) => (
        <span className="odo-digit" key={str.length - i} aria-hidden="true">
          <span className="odo-strip" style={{ transform: `translateY(-${Number(d) * 10}%)` }}>
            {DIGITS.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
