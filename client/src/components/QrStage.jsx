import { useEffect, useRef, useState } from 'react';
import Qr from './Qr.jsx';
import Odometer from './Odometer.jsx';
import { Close } from './Icons.jsx';
import { destructStatus, prettyUrl } from '../lib/util.js';

// "host.app/abc123" → ["host.app", "abc123"], so the code can be set huge on its own line.
const splitShort = (url) => {
  const pretty = prettyUrl(url);
  const at = pretty.lastIndexOf('/');
  return [pretty.slice(0, at), pretty.slice(at + 1)];
};

// Demo mode: a QR big enough to scan off a projector, with the click counter rolling live.
export default function QrStage({ link, onClose }) {
  const [bump, setBump] = useState(null);
  const last = useRef(link.clicks);
  const closeRef = useRef(null);
  const status = destructStatus(link);
  const [host, code] = splitShort(link.shortUrl);

  useEffect(() => {
    const gained = link.clicks - last.current;
    last.current = link.clicks;
    if (gained > 0) setBump({ n: gained, at: Date.now() });
  }, [link.clicks]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="stage" role="dialog" aria-modal="true" aria-labelledby="stage-title" onClick={onClose}>
      <button ref={closeRef} className="icon-btn stage-close" onClick={onClose} aria-label="Close">
        <Close />
      </button>

      <div className="stage-inner" onClick={(e) => e.stopPropagation()}>
        <div className={`stage-qr ${link.buriedAt ? 'is-dead' : ''}`}>
          <Qr value={link.shortUrl} />
          {link.buriedAt && <span className="stamp stage-stamp">Self-destructed</span>}
        </div>

        <div className="stage-copy">
          <p className="stage-kicker">{link.buriedAt ? 'That was the last one.' : 'Point your phone camera here'}</p>
          <h2 id="stage-title" className="stage-url">
            <span className="stage-host">{host}/</span>
            {code}
          </h2>
          <div className="stage-count">
            <span className="counter-label">Clicks, live</span>
            <span className="stage-odo">
              <Odometer value={link.clicks} digits={3} />
              {bump && (
                <span key={bump.at} className="bump bump-big">
                  +{bump.n}
                </span>
              )}
            </span>
          </div>
          {status && !link.buriedAt && <p className="stage-status">This stub self-destructs: {status}.</p>}
        </div>
      </div>
    </div>
  );
}
