import { useCallback, useEffect, useRef, useState } from 'react';
import Printer from './components/Printer.jsx';
import Desk from './components/Desk.jsx';
import Graveyard from './components/Graveyard.jsx';
import Notice from './components/Notice.jsx';
import QrStage from './components/QrStage.jsx';
import { InkFilters } from './components/Doodles.jsx';
import { Moon, Speaker, SpeakerOff, Sun } from './components/Icons.jsx';
import { api } from './lib/api.js';
import { sfx } from './lib/sfx.js';
import { usePref } from './lib/util.js';

const POLL_MS = 4000;
const STAGE_POLL_MS = 1500; // quicker while the QR is up on a projector
const BUMP_MS = 1800;

function readNotice() {
  const params = new URLSearchParams(window.location.search);
  const rip = params.get('rip');
  const lost = params.get('lost');
  if (!rip && !lost) return null;
  return rip ? { kind: 'rip', code: rip } : { kind: 'lost', code: lost };
}

export default function App() {
  const [theme, setTheme] = usePref('stub.theme', () => document.documentElement.dataset.theme || 'light');
  const [sound, setSound] = usePref('stub.sound', true);
  const [view, setView] = useState('desk');
  const [links, setLinks] = useState([]);
  const [buried, setBuried] = useState([]);
  const [stats, setStats] = useState({ links: 0, clicks: 0, base: '' });
  const [offline, setOffline] = useState('');
  const [notice, setNotice] = useState(readNotice);
  const [claim, setClaim] = useState(null);
  const [stage, setStage] = useState(null);
  const [bumps, setBumps] = useState(null);
  const seenClicks = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => sfx.setEnabled(sound), [sound]);

  // Tidy ?rip= / ?lost= out of the address bar once the notice has been read.
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [l, b, s] = await Promise.all([api.list(), api.graveyard(), api.stats()]);
      // Ring the bell for clicks that arrived since the last poll (buried too: a self-destruct's final click counts).
      const all = [...l, ...b];
      const seen = seenClicks.current;
      if (seen) {
        const gained = {};
        for (const link of all) {
          const delta = link.clicks - (seen.get(link.code) ?? link.clicks);
          if (delta > 0) gained[link.code] = delta;
        }
        if (Object.keys(gained).length) {
          sfx.ding();
          setBumps({ at: Date.now(), gained });
        }
      }
      seenClicks.current = new Map(all.map((link) => [link.code, link.clicks]));
      setLinks(l);
      setBuried(b);
      setStats(s);
      setOffline('');
    } catch (err) {
      setOffline(err.message);
    }
  }, []);

  // Poll so click counters roll up live while you share your links.
  useEffect(() => {
    refresh();
    const id = setInterval(() => document.visibilityState === 'visible' && refresh(), stage ? STAGE_POLL_MS : POLL_MS);
    return () => clearInterval(id);
  }, [refresh, stage]);

  useEffect(() => {
    if (!bumps) return;
    const t = setTimeout(() => setBumps(null), BUMP_MS);
    return () => clearTimeout(t);
  }, [bumps]);

  async function bury(code) {
    try {
      await api.bury(code);
    } finally {
      refresh();
    }
  }

  async function revive(code) {
    sfx.zap();
    try {
      await api.revive(code);
    } finally {
      refresh();
    }
  }

  function show(next) {
    setView(next);
    requestAnimationFrame(() => document.getElementById('desk-or-graveyard')?.scrollIntoView({ behavior: 'smooth' }));
  }

  const closeStage = useCallback(() => setStage(null), []);

  // The stage follows the live copy of its link, wherever it currently lives.
  const staged = stage && ([...links, ...buried].find((l) => l.code === stage.code) ?? stage);

  return (
    <>
      <InkFilters />

      <header className="masthead">
        <a className="logo" href="/" aria-label="stub. home">
          stub<span>.</span>
        </a>
        <nav className="tabs" aria-label="Sections">
          <button aria-current={view === 'desk' ? 'page' : undefined} onClick={() => show('desk')}>
            Desk <span className="tab-count">{links.length}</span>
          </button>
          <button aria-current={view === 'graveyard' ? 'page' : undefined} onClick={() => show('graveyard')}>
            Graveyard <span className="tab-count">{buried.length}</span>
          </button>
        </nav>
        <div className="toggles">
          <button
            className="icon-btn"
            onClick={() => setSound((s) => !s)}
            aria-pressed={sound}
            aria-label="Printer sounds"
            title={sound ? 'Mute printer sounds' : 'Turn printer sounds on'}
          >
            {sound ? <Speaker /> : <SpeakerOff />}
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? 'Switch to paper (light) theme' : 'Switch to darkroom (dark) theme'}
            title={theme === 'dark' ? 'Paper' : 'Darkroom'}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>
            Long links,
            <br />
            printed <span className="marker">short</span>.
          </h1>
          <p className="lede">
            Paste an unwieldy URL. We set it in type, stamp it, and hand you a stub to tear off and share.
          </p>
        </section>

        {offline && (
          <p className="offline" role="alert">
            {offline}
          </p>
        )}

        <Printer key={claim?.at} stats={stats} claim={claim} onPrinted={refresh} onStage={setStage} />

        <div id="desk-or-graveyard">
          {view === 'desk' ? (
            <Desk links={links} bumps={bumps} onBury={bury} onStage={setStage} />
          ) : (
            <Graveyard buried={buried} onRevive={revive} />
          )}
        </div>
      </main>

      <footer className="colophon">
        <p className="colophon-mark">
          stub<span>.</span>
        </p>
        <p>No links were harmed in the making of this site. A few were buried.</p>
        <p>Built with MongoDB, Express, React and Node.</p>
      </footer>

      {notice && (
        <Notice notice={notice} onClose={() => setNotice(null)} onClaim={(code) => setClaim({ code, at: Date.now() })} />
      )}
      {staged && <QrStage link={staged} onClose={closeStage} />}
    </>
  );
}
