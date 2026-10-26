import { useEffect, useRef, useState } from 'react';
import Ticket from './Ticket.jsx';
import Dials from './Dials.jsx';
import Odometer from './Odometer.jsx';
import { api } from '../lib/api.js';
import { sfx } from '../lib/sfx.js';

const LOOKS_LIKE_URL = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i;
const DEFAULTS = { alias: '', stamp: 'shortened', ink: 'vermilion', destruct: '' };

const isTyping = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');
const modalOpen = () => document.querySelector('[aria-modal="true"]');

// `claim` (from the Lost & Found note) pre-fills the alias; App remounts us when it changes.
export default function Printer({ stats, onPrinted, onStage, claim }) {
  const claimed = claim ? claim.code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) : '';
  const [url, setUrl] = useState('');
  const [opts, setOpts] = useState({ ...DEFAULTS, alias: claimed });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [run, setRun] = useState(0);
  const urlRef = useRef(null);

  // "/" jumps to the feed; pasting a link anywhere on the page loads it into the printer.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || isTyping(e.target) || modalOpen()) return;
      e.preventDefault();
      urlRef.current?.focus();
    }
    function onPaste(e) {
      if (isTyping(e.target) || modalOpen()) return;
      const text = e.clipboardData?.getData('text')?.trim();
      if (!text || !LOOKS_LIKE_URL.test(text)) return;
      e.preventDefault();
      setUrl(text);
      setError('');
      setLoaded((n) => n + 1);
      urlRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!url.trim()) {
      setError('Feed me a link first.');
      urlRef.current?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const link = await api.create({
        url,
        alias: opts.alias.trim() || undefined,
        stamp: opts.stamp,
        ink: opts.ink,
        destruct: opts.destruct || undefined,
      });
      sfx.print();
      setTicket(link);
      setRun((n) => n + 1);
      setUrl('');
      setOpts((o) => ({ ...o, alias: '' }));
      onPrinted?.(link);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="printer" aria-label="Shorten a link">
      <form className={`machine ${busy ? 'is-busy' : ''}`} onSubmit={submit} noValidate>
        <div className="machine-top">
          <span className="machine-model">
            <b>S-1</b> Link printer
          </span>
          <div className="counter-window" aria-label="Totals">
            <span>
              <span className="counter-label">Printed</span>
              <Odometer value={stats.links} digits={5} />
            </span>
            <span>
              <span className="counter-label">Served</span>
              <Odometer value={stats.clicks} digits={5} />
            </span>
          </div>
          <span
            key={loaded}
            className={`led ${(ticket || loaded) && !busy ? 'is-ready' : ''} ${loaded ? 'is-loaded' : ''}`}
            aria-hidden="true"
          />
        </div>

        <div className="feed">
          <label className="sr-only" htmlFor="url">
            Long URL
          </label>
          <input
            id="url"
            ref={urlRef}
            autoFocus={Boolean(claimed)}
            className="field"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck="false"
            placeholder="https://a-very-long-and-unwieldy.link/that/goes/on?and=on"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
          />
          <button className="btn btn-print" type="submit" disabled={busy}>
            {busy ? 'Printing…' : 'Print it'}
            <kbd aria-hidden="true">Enter</kbd>
          </button>
        </div>

        <Dials
          base={stats.base}
          value={opts}
          onChange={(next) => {
            setOpts(next);
            setError('');
          }}
        />

        {error ? (
          <p className="error" role="alert" key={error}>
            {error}
          </p>
        ) : (
          <p className="machine-hint">
            Paste a link anywhere on the page, or press <kbd>/</kbd> to start typing.
          </p>
        )}
      </form>

      <div className="slot" aria-hidden="true" />
      {ticket ? (
        <Ticket key={run} link={ticket} onStage={onStage} />
      ) : (
        <p className="slot-hint">Your ticket prints here.</p>
      )}
    </section>
  );
}
