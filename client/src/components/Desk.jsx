import { useState } from 'react';
import Odometer from './Odometer.jsx';
import { WeekChart } from './Marks.jsx';
import { ArrowUpRight, Close, CornerDownRight, Flame, Monitor, Phone } from './Icons.jsx';
import { copyText, destructStatus, plural, prettyUrl, relTime, stampDate, ticketNo, tiltFor } from '../lib/util.js';
import { stampLabel } from '../lib/options.js';
import { sfx } from '../lib/sfx.js';

function LinkCard({ link, index, bump, onBury, onStage }) {
  const [copied, setCopied] = useState(false);
  const [sinking, setSinking] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const status = destructStatus(link);

  async function copy() {
    await copyText(link.shortUrl);
    sfx.tear();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function bury() {
    sfx.thud();
    setSinking(true);
    setTimeout(() => onBury(link.code), 550);
  }

  return (
    <li
      className={`card ${sinking ? 'is-sinking' : ''} ${bump ? 'is-bumped' : ''}`}
      style={{ '--tilt': `${tiltFor(link.code)}deg`, '--i': Math.min(index, 8), '--stamp-ink': `var(--ink-${link.ink})` }}
    >
      <div className={`card-inner ${flipped ? 'is-flipped' : ''}`}>
        <div className="face face-front" inert={flipped}>
          <p className="card-meta">
            {ticketNo(link.ticketNo)} · {stampDate(link.createdAt)}
          </p>
          <span className="mini-stamp" aria-hidden="true">
            {stampLabel(link)}
          </span>

          <button className="card-short" onClick={copy} title="Copy short link">
            {prettyUrl(link.shortUrl)}
            {copied && <span className="card-copied">Copied</span>}
          </button>
          <a className="card-long" href={link.url} target="_blank" rel="noreferrer" title={link.url}>
            <CornerDownRight size={14} /> {prettyUrl(link.url)}
          </a>

          <div className="card-stats">
            <div className="card-clicks">
              <span className="counter-label">Clicks</span>
              <Odometer value={link.clicks} />
              {bump && (
                <span key={bump.at} className="bump">
                  +{bump.n}
                </span>
              )}
            </div>
            <p className={`card-status ${status ? 'is-destruct' : ''}`}>
              {status ? (
                <>
                  <Flame size={14} /> {status}
                </>
              ) : link.lastClickedAt ? (
                `last click ${relTime(link.lastClickedAt)}`
              ) : (
                'no clicks yet'
              )}
            </p>
          </div>

          <div className="card-actions">
            <button className="act" onClick={copy}>
              Copy
            </button>
            <a className="act" href={link.shortUrl} target="_blank" rel="noreferrer">
              Visit <ArrowUpRight size={14} />
            </a>
            <button className="act" onClick={() => onStage(link)}>
              QR
            </button>
            <button className="act" onClick={() => setFlipped(true)}>
              Log
            </button>
            <button className="act act-danger" onClick={bury} disabled={sinking}>
              Bury
            </button>
          </div>
        </div>

        <div className="face face-back" inert={!flipped}>
          <div className="log-head">
            <h3>Visit log</h3>
            <button className="icon-btn icon-btn-sm" onClick={() => setFlipped(false)} aria-label="Back to the front">
              <Close size={16} />
            </button>
          </div>
          <p className="log-sub">
            /{link.code} · {plural(link.clicks, 'click')} in total
          </p>

          <WeekChart data={link.week} />

          {link.recent?.length ? (
            <ul className="log">
              {link.recent.slice(0, 3).map((v, i) => (
                <li key={i}>
                  {v.device === 'phone' ? <Phone size={15} /> : <Monitor size={15} />}
                  <span className="log-from">{v.from || 'Direct or QR scan'}</span>
                  <span className="log-at">{relTime(v.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="log-empty">No visits yet. Share the stub and this fills up.</p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Desk({ links, bumps, onBury, onStage }) {
  return (
    <section className="section" id="desk" aria-labelledby="desk-title">
      <header className="section-head">
        <h2 id="desk-title">The desk</h2>
        <p className="section-sub">
          {links.length ? `${plural(links.length, 'stub')} in circulation. ` : ''}Click counts update live. Flip a stub
          with Log to see who came through.
        </p>
      </header>

      {links.length === 0 ? (
        <div className="empty">
          <p>Nothing printed yet. The printer is getting bored.</p>
        </div>
      ) : (
        <ul className="cards">
          {links.map((link, i) => (
            <LinkCard
              key={link.code}
              link={link}
              index={i}
              bump={bumps?.gained[link.code] ? { n: bumps.gained[link.code], at: bumps.at } : null}
              onBury={onBury}
              onStage={onStage}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
