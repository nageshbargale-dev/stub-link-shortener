import { useEffect, useState } from 'react';

export const prettyUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const ticketNo = (n) => `NO. ${String(n).padStart(6, '0')}`;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function stampDate(value, withTime = false) {
  const d = new Date(value);
  const date = `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

// Small deterministic hash so each link gets a stable tilt, barcode and epitaph.
export function hashOf(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

const EPITAPHS = [
  'it redirected so that others might arrive',
  'gone, but never 404gotten',
  "302'd to a better place",
  'short life. as intended.',
  'here lies a link that went the distance',
  'it pointed the way, until it didn’t',
  'loved by many. clicked by some.',
  'now resting in /dev/null',
];

export function epitaphFor(link) {
  if (link.buriedReason === 'clicks') {
    return `self-destructed after ${plural(link.maxClicks, 'click')}, as instructed`;
  }
  if (link.buriedReason === 'time') return 'expired right on schedule. no regrets.';
  return EPITAPHS[hashOf(link.code) % EPITAPHS.length];
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function span(ms) {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function relTime(value) {
  const ms = Date.now() - new Date(value).getTime();
  return ms < 45_000 ? 'just now' : `${span(ms)} ago`;
}

// "7 clicks left" / "expires in 3h" — or null when the link lives forever.
export function destructStatus(link) {
  if (link.maxClicks) return `${plural(Math.max(0, link.maxClicks - link.clicks), 'click')} left`;
  if (link.expiresAt) return `expires in ${span(new Date(link.expiresAt) - Date.now())}`;
  return null;
}

export function destructRule(link) {
  if (link.maxClicks) return `After ${plural(link.maxClicks, 'click')}`;
  if (link.expiresAt) return stampDate(link.expiresAt, true);
  return null;
}

export const tiltFor = (code, max = 1.4) => (((hashOf(code) % 1000) / 1000) * 2 - 1) * max;

// useState that remembers itself in localStorage (and survives when storage is blocked).
export function usePref(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return typeof initial === 'function' ? initial() : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}
