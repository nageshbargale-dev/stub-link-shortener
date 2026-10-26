import { DESTRUCT, INKS, STAMPS } from '../lib/options.js';
import { prettyUrl } from '../lib/util.js';

// The control strip along the bottom of the machine: ending, stamp, ink, self-destruct.
export default function Dials({ base, value, onChange }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });

  return (
    <div className="dials">
      <label className="dial dial-ending">
        <span className="dial-label">Ending</span>
        <span className="dial-well alias">
          <span className="alias-prefix">{base ? `${prettyUrl(base)}/` : '/'}</span>
          <input
            className="alias-field"
            value={value.alias}
            maxLength={32}
            placeholder="random"
            spellCheck="false"
            onChange={(e) => onChange({ ...value, alias: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
          />
        </span>
      </label>

      <label className="dial">
        <span className="dial-label">Stamp</span>
        <select className="dial-well select" value={value.stamp} onChange={set('stamp')}>
          {STAMPS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="dial">
        <legend className="dial-label">Ink</legend>
        <div className="swatches">
          {INKS.map((ink) => (
            <label key={ink.key} className="swatch" style={{ '--swatch': `var(--ink-${ink.key})` }} title={ink.label}>
              <input
                type="radio"
                name="ink"
                value={ink.key}
                checked={value.ink === ink.key}
                onChange={set('ink')}
                aria-label={ink.label}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="dial">
        <span className="dial-label">Self-destruct</span>
        <select className="dial-well select" value={value.destruct} onChange={set('destruct')}>
          {DESTRUCT.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
