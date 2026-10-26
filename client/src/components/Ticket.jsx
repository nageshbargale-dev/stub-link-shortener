import { useEffect, useState } from 'react';
import Qr from './Qr.jsx';
import { Barcode } from './Marks.jsx';
import { Expand, Printer, Scissors } from './Icons.jsx';
import { copyText, destructRule, prettyUrl, stampDate, ticketNo } from '../lib/util.js';
import { stampLabel } from '../lib/options.js';
import { sfx } from '../lib/sfx.js';

const STAMP_DELAY = 1050; // just after the 1s print animation finishes

export default function Ticket({ link, onStage }) {
  const [printed, setPrinted] = useState(false);
  const [torn, setTorn] = useState(false);
  const rule = destructRule(link);

  useEffect(() => {
    const t = setTimeout(() => sfx.stamp(), STAMP_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!torn) return;
    const t = setTimeout(() => setTorn(false), 2600);
    return () => clearTimeout(t);
  }, [torn]);

  async function tear() {
    if (torn) return;
    await copyText(link.shortUrl);
    sfx.tear();
    setTorn(true);
  }

  return (
    <>
      <div className={`ticket-window ${printed ? 'is-printed' : ''}`}>
        <article
          className="ticket"
          style={{ '--stamp-ink': `var(--ink-${link.ink || 'vermilion'})` }}
          onAnimationEnd={(e) => e.target === e.currentTarget && setPrinted(true)}
        >
          <div className="ticket-body">
            <p className="ticket-head">
              <span>stub. link printing co.</span>
              <span>Customer copy</span>
            </p>

            <dl className="ticket-meta">
              <div>
                <dt>Ticket</dt>
                <dd>{ticketNo(link.ticketNo)}</dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>{stampDate(link.createdAt, true)}</dd>
              </div>
              {rule && (
                <div>
                  <dt>Self-destructs</dt>
                  <dd>{rule}</dd>
                </div>
              )}
            </dl>

            <div className="ticket-route">
              <p className="ticket-label">From</p>
              <p className="ticket-long">{link.url}</p>
              <p className="ticket-label">To</p>
              <a className="ticket-short" href={link.shortUrl} target="_blank" rel="noreferrer">
                {prettyUrl(link.shortUrl)}
              </a>
            </div>

            <div className="ticket-foot">
              <button className="qr-btn" onClick={() => onStage?.(link)} title="Show full screen">
                <Qr value={link.shortUrl} />
                <span className="qr-zoom">
                  <Expand size={16} />
                </span>
              </button>
              <p>
                Thank you for
                <br />
                shortening.
                <br />
                <strong>Please keep this stub.</strong>
              </p>
            </div>
            <Barcode code={link.code} />

            <span className="stamp" aria-hidden="true">
              {stampLabel(link)}
            </span>
          </div>

          <button className={`ticket-stub ${torn ? 'is-torn' : ''}`} onClick={tear} aria-label="Copy short link">
            <span className="ticket-stub-cta">
              <Scissors size={15} /> Tear here to copy
            </span>
            <span className="ticket-stub-code">/{link.code}</span>
          </button>
          {torn && (
            <p className="copied-note" role="status">
              Copied
            </p>
          )}
        </article>
      </div>

      <div className="ticket-tools">
        <button className="act" onClick={() => onStage?.(link)}>
          <Expand size={16} /> Show QR full screen
        </button>
        <button className="act" onClick={() => window.print()}>
          <Printer size={16} /> Print ticket
        </button>
      </div>
    </>
  );
}
