const OWNER_KEY = 'stub.owner';
let memoryOwner;

// A random id per browser stands in for an account — your desk is yours alone.
function ownerId() {
  try {
    const saved = localStorage.getItem(OWNER_KEY);
    if (saved) return saved;
  } catch {
    /* storage blocked — fall through to an in-memory id */
  }
  memoryOwner ||= randomId();
  try {
    localStorage.setItem(OWNER_KEY, memoryOwner);
  } catch {
    /* ignore */
  }
  return memoryOwner;
}

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: { 'content-type': 'application/json', 'x-owner-id': ownerId() },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('The printer is offline. Is the server running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something jammed. Try again?');
  return data;
}

const enc = encodeURIComponent;

export const api = {
  stats: () => request('/stats'),
  list: () => request('/links'),
  graveyard: () => request('/graveyard'),
  get: (code) => request(`/links/${enc(code)}`),
  // { url, alias?, stamp?, ink?, destruct? }
  create: (body) => request('/links', { method: 'POST', body }),
  bury: (code) => request(`/links/${enc(code)}`, { method: 'DELETE' }),
  revive: (code) => request(`/links/${enc(code)}/revive`, { method: 'POST' }),
};
