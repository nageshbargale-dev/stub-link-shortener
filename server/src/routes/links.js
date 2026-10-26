import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { DESTRUCT, INKS, Link, STAMPS, nextTicketNo } from '../models/Link.js';

// No look-alikes (0/O, 1/l/I) so codes survive being read aloud or handwritten.
const makeCode = customAlphabet('23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', 6);

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const RESERVED = new Set(['api', 'assets', 'rip', 'graveyard', 'health', 'favicon.ico']);
const OWNER_RE = /^[a-zA-Z0-9_-]{8,64}$/;

const router = Router();

// Each browser keeps a random owner id in localStorage and sends it along —
// lightweight "accounts" without a login screen.
function requireOwner(req, res, next) {
  const owner = req.get('x-owner-id');
  if (!owner || !OWNER_RE.test(owner)) {
    return res.status(400).json({ error: 'Missing or invalid x-owner-id header.' });
  }
  req.owner = owner;
  next();
}

function normalizeUrl(raw) {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value || value.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.toString();
  } catch {
    return null;
  }
}

const baseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

router.get('/stats', async (req, res) => {
  const [agg] = await Link.aggregate([
    { $group: { _id: null, links: { $sum: 1 }, clicks: { $sum: '$clicks' } } },
  ]);
  res.json({ links: agg?.links ?? 0, clicks: agg?.clicks ?? 0, base: baseUrl(req) });
});

router.post('/links', requireOwner, async (req, res) => {
  const url = normalizeUrl(req.body?.url);
  if (!url) return res.status(400).json({ error: "That doesn't look like a web address." });

  if (new URL(url).host === new URL(baseUrl(req)).host) {
    return res.status(400).json({ error: 'Shortening a stub link? Very meta. Not allowed though.' });
  }

  const { stamp = 'shortened', ink = 'vermilion', destruct } = req.body ?? {};
  if (!STAMPS.includes(stamp)) return res.status(400).json({ error: 'Unknown stamp.' });
  if (!INKS.includes(ink)) return res.status(400).json({ error: 'Unknown ink colour.' });
  if (destruct && !Object.hasOwn(DESTRUCT, destruct)) {
    return res.status(400).json({ error: 'Unknown self-destruct setting.' });
  }
  const rule = destruct ? DESTRUCT[destruct] : {};

  const alias = req.body?.alias?.trim();
  let code;
  if (alias) {
    if (!ALIAS_RE.test(alias)) {
      return res.status(400).json({ error: 'Aliases are 3–32 letters, numbers, dashes or underscores.' });
    }
    if (RESERVED.has(alias.toLowerCase()) || (await Link.exists({ code: alias }))) {
      return res.status(409).json({ error: `"${alias}" is already taken. Try another?` });
    }
    code = alias;
  } else {
    do code = makeCode();
    while (await Link.exists({ code }));
  }

  const link = await Link.create({
    code,
    url,
    owner: req.owner,
    custom: Boolean(alias),
    stamp,
    ink,
    maxClicks: rule.maxClicks ?? null,
    expiresAt: rule.ms ? new Date(Date.now() + rule.ms) : null,
    ticketNo: await nextTicketNo(),
  });
  res.status(201).json(link.toPublic(baseUrl(req)));
});

router.get('/links', requireOwner, async (req, res) => {
  await Link.buryExpired({ owner: req.owner });
  const links = await Link.find({ owner: req.owner, buriedAt: null }).sort({ createdAt: -1 }).limit(100);
  res.json(links.map((l) => l.toPublic(baseUrl(req))));
});

router.get('/graveyard', requireOwner, async (req, res) => {
  await Link.buryExpired({ owner: req.owner });
  const links = await Link.find({ owner: req.owner, buriedAt: { $ne: null } }).sort({ buriedAt: -1 }).limit(50);
  res.json(links.map((l) => l.toPublic(baseUrl(req))));
});

// Public read — used by the tombstone page when someone visits a buried link.
router.get('/links/:code', async (req, res) => {
  await Link.buryExpired({ code: req.params.code });
  const link = await Link.findOne({ code: req.params.code });
  if (!link) return res.status(404).json({ error: 'No such stub.' });
  res.json(link.toPublic(baseUrl(req)));
});

router.delete('/links/:code', requireOwner, async (req, res) => {
  const link = await Link.findOneAndUpdate(
    { code: req.params.code, owner: req.owner, buriedAt: null },
    { $set: { buriedAt: new Date(), buriedReason: 'manual' } },
    { returnDocument: 'after' }
  );
  if (!link) return res.status(404).json({ error: 'No such stub.' });
  res.json(link.toPublic(baseUrl(req)));
});

// Bring a link back from the dead. Any self-destruct rule is lifted, or it would just die again.
router.post('/links/:code/revive', requireOwner, async (req, res) => {
  const link = await Link.findOneAndUpdate(
    { code: req.params.code, owner: req.owner, buriedAt: { $ne: null } },
    { $set: { buriedAt: null, buriedReason: null, maxClicks: null, expiresAt: null } },
    { returnDocument: 'after' }
  );
  if (!link) return res.status(404).json({ error: 'Nothing to revive.' });
  res.json(link.toPublic(baseUrl(req)));
});

export default router;
