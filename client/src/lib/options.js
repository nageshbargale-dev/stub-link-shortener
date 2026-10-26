// Printer settings. Keys must match the server allow-lists in server/src/models/Link.js.

export const STAMPS = [
  { key: 'shortened', label: 'Shortened' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'top-secret', label: 'Top secret' },
  { key: 'with-love', label: 'With love' },
  { key: 'approved', label: 'Approved' },
  { key: 'fragile', label: 'Fragile' },
];

export const INKS = [
  { key: 'vermilion', label: 'Vermilion' },
  { key: 'cobalt', label: 'Cobalt' },
  { key: 'forest', label: 'Forest' },
  { key: 'carbon', label: 'Carbon' },
];

export const DESTRUCT = [
  { key: '', label: 'Never' },
  { key: '1c', label: 'After 1 click' },
  { key: '10c', label: 'After 10 clicks' },
  { key: '100c', label: 'After 100 clicks' },
  { key: '1h', label: 'In 1 hour' },
  { key: '1d', label: 'In 1 day' },
  { key: '7d', label: 'In 7 days' },
];

export function stampLabel(link) {
  if (link.stamp === 'shortened' && link.custom) return 'Custom made';
  return STAMPS.find((s) => s.key === link.stamp)?.label ?? 'Shortened';
}
