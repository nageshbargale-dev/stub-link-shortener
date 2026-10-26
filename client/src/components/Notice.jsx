import { useEffect, useState } from 'react';
import { Tombstone } from './Graveyard.jsx';
import { api } from '../lib/api.js';

// Shown when someone arrives from a buried (?rip=) or non-existent (?lost=) short link.
export default function Notice({ notice, onClose, onClaim }) {
  const [link, setLink] = useState(null);

  useEffect(() => {
    if (notice.kind === 'rip') api.get(notice.code).then(setLink).catch(() => {});
  }, [notice]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        onClick={(e) => e.stopPropagation()}
      >
        {notice.kind === 'rip' ? (
          <>
            <h2 id="notice-title">This link has passed on.</h2>
            <p>
              The stub <code>/{notice.code}</code>{' '}
              {link && link.buriedReason !== 'manual' && link.buriedReason
                ? 'self-destructed, exactly as its owner asked,'
                : 'was buried by its owner'}{' '}
              and no longer leads anywhere. Please pay your respects.
            </p>
            {link && (
              <ul className="graves graves-solo">
                <Tombstone link={link} big />
              </ul>
            )}
            <button className="btn" onClick={onClose} autoFocus>
              Pay respects &amp; continue
            </button>
          </>
        ) : (
          <>
            <h2 id="notice-title">Nobody ever printed that one.</h2>
            <p>
              We looked everywhere, even under the printer. <code>/{notice.code}</code> doesn’t exist yet, which means…
            </p>
            <p className="notice-grab">It’s up for grabs.</p>
            <div className="notice-actions">
              <button
                className="btn btn-print"
                onClick={() => {
                  onClaim(notice.code);
                  onClose();
                }}
                autoFocus
              >
                Claim /{notice.code}
              </button>
              <button className="act" onClick={onClose}>
                No thanks
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
