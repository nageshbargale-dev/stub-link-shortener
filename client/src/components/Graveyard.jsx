import { Revive } from './Icons.jsx';
import { epitaphFor, plural, stampDate, tiltFor } from '../lib/util.js';

export function Tombstone({ link, onRevive, big = false }) {
  return (
    <li className={`grave ${big ? 'grave-big' : ''}`} style={{ '--tilt': `${tiltFor(link.code, 2.5)}deg` }}>
      <div className="stone">
        <p className="stone-rip">R.I.P.</p>
        <p className="stone-code">/{link.code}</p>
        <p className="stone-dates">
          {stampDate(link.createdAt)} – {stampDate(link.buriedAt || link.updatedAt || link.createdAt)}
        </p>
        <p className="stone-clicks">served {plural(link.clicks, 'click')}</p>
        <p className="stone-epitaph">“{epitaphFor(link)}”</p>
      </div>
      <div className="grass" aria-hidden="true" />
      {onRevive && (
        <button className="act act-revive" onClick={() => onRevive(link.code)}>
          <Revive size={15} /> Revive
        </button>
      )}
    </li>
  );
}

export default function Graveyard({ buried, onRevive }) {
  return (
    <section className="section graveyard" id="graveyard" aria-labelledby="graveyard-title">
      <header className="section-head">
        <h2 id="graveyard-title">The link graveyard</h2>
        <p className="section-sub">
          {buried.length ? `${plural(buried.length, 'stub')} laid to rest. ` : ''}Buried and self-destructed links stop
          redirecting, and visitors get a tombstone instead. Changed your mind? Bring one back.
        </p>
      </header>

      {buried.length === 0 ? (
        <div className="empty">
          <p>No casualties yet. Every link is alive and well.</p>
        </div>
      ) : (
        <ul className="graves">
          {buried.map((link) => (
            <Tombstone key={link.code} link={link} onRevive={onRevive} />
          ))}
        </ul>
      )}
    </section>
  );
}
