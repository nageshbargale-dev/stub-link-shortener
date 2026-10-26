import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Link } from './models/Link.js';
import linksRouter from './routes/links.js';

// Where the React app lives. Empty = same origin (production build served below).
const CLIENT_URL = process.env.CLIENT_URL || '';
const CLIENT_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: CLIENT_URL || true }));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(
  '/api',
  rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }),
  linksRouter
);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown endpoint.' }));

if (fs.existsSync(CLIENT_DIST)) app.use(express.static(CLIENT_DIST));

// The whole point: /:code → original URL.
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;
  try {
    await Link.buryExpired({ code });
    const device = /Mobi|Android|iPhone|iPad/i.test(req.get('user-agent') || '') ? 'phone' : 'desktop';
    const link = await Link.recordVisit(code, req.get('referer') || '', device);
    if (link) return res.redirect(302, link.url);

    const buried = await Link.exists({ code, buriedAt: { $ne: null } });
    res.redirect(302, `${CLIENT_URL}/?${buried ? 'rip' : 'lost'}=${encodeURIComponent(code)}`);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'The printer jammed. Please try again.' });
});

export default app;
