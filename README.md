# stub. Links, printed short

A link shortener built on the **MERN** stack (MongoDB, Express, React, Node) that treats every short link as a physical object. Paste a long URL and a thermal-receipt **ticket prints out of the machine**, gets **rubber-stamped**, and you **tear off the stub to copy** the link.

## Features

| Feature | What it does |
|---|---|
| Shorten | Random 6-character codes (no look-alikes such as `0/O` or `1/l`) or your own custom ending |
| Printed ticket | Ticket number, timestamp, struck-through original URL, scannable QR code, a barcode unique to each link, and a rubber stamp |
| Stamps and ink | Choose the stamp (Urgent, Top secret, With love…) and ink colour before printing. Saved with the link |
| Self-destructing links | Expire after 1, 10 or 100 clicks, or after an hour, a day or a week. Expired links move to the graveyard on their own |
| Tear to copy | Click the perforated stub and it tears off and falls away while the link is copied |
| The desk | Your links as taped-down stubs with rolling click counters. Polls every 4 seconds; a bell rings and a +1 pops when a click lands |
| Visit log | Flip a stub to see clicks per day for the week and the latest visits: when, where from, phone or desktop |
| Demo mode | Show any link's QR code full screen with a live counter, so a room can scan it from a projector |
| Link graveyard | Deleting buries a link under a tombstone with an epitaph. Visitors to a buried link see the tombstone. Links can be revived |
| Lost and found | Visiting a code that doesn't exist offers to let you claim it as your ending |
| Shortcuts | Paste a link anywhere on the page to load it, press `/` to focus the input, print a ticket on real paper |
| Printer sounds | Printer chatter, stamp thud, paper tear and bell, synthesized with the Web Audio API (no audio files). Mutable |
| Darkroom mode | Full dark theme, remembered per browser |
| No login | Each browser gets a random owner id, so your desk only shows your links |

## Design

The site is styled as a print shop: newsprint background, an enamel printer, thermal-paper tickets and one vermilion ink.

- **Type:** Archivo at wide widths for headlines, Schibsted Grotesk for the interface, IBM Plex Mono for tickets and counters.
- **Details:** SVG paper grain, stamp ink roughened with an SVG turbulence filter, zig-zag torn edges made with CSS masks, cards tilted by a hash of their code, a print stylesheet that prints only the ticket.
- All motion respects `prefers-reduced-motion`.

## Run it locally

Requires Node 18+.

```bash
npm run install:all     # installs root, server and client deps
npm run dev             # server on :5000, React on :5173
```

Open http://localhost:5173.

**Database:** set `MONGO_URI` in `server/.env` to a local MongoDB or a free MongoDB Atlas cluster. If it's left empty, the server starts a temporary **in-memory MongoDB** so the project runs with zero setup (data resets on restart).

## Production / deploy

```bash
npm run build           # builds the React app into client/dist
npm start               # Express serves the API, the redirects AND the built app on one port
```

For a host like Render or Railway:

- **Build command:** `npm run install:all && npm run build`
- **Start command:** `npm start`
- **Environment variables:** set `MONGO_URI`. Leave `BASE_URL` and `CLIENT_URL` empty (same origin).

## Deploy to Vercel

1. Create a free MongoDB Atlas cluster and copy its connection string (allow access from `0.0.0.0/0`).
2. Push this folder to GitHub and import the repo in Vercel (framework preset: **Other**, root directory: the repo root).
3. Add one environment variable, `MONGO_URI`, then deploy. `vercel.json` handles the rest: the React build is served statically and `api/index.js` runs Express as a serverless function for `/api/*` and the `/:code` redirects.

## API

All `/api` routes are rate limited (120 requests/min). Owner routes need an `x-owner-id` header.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/links` | Create `{ url, alias?, stamp?, ink?, destruct? }` |
| `GET` | `/api/links` | Your live links |
| `GET` | `/api/graveyard` | Your buried links |
| `GET` | `/api/links/:code` | Public details of one link |
| `DELETE` | `/api/links/:code` | Bury (soft delete) |
| `POST` | `/api/links/:code/revive` | Un-bury |
| `GET` | `/api/stats` | Global totals |
| `GET` | `/:code` | **The redirect.** 302 to the original URL; records the click with referrer and device type |

`stamp` is one of `shortened`, `urgent`, `top-secret`, `with-love`, `approved`, `fragile`. `ink` is one of `vermilion`, `cobalt`, `forest`, `carbon`. `destruct` is one of `1c`, `10c`, `100c` (clicks) or `1h`, `1d`, `7d` (time).

## Structure

```
server/src/
  index.js          Express app, redirect route, serves client build
  db.js             MongoDB connection (Atlas/local, or in-memory fallback)
  models/Link.js    Link schema, click recording, ticket counter
  routes/links.js   REST API
client/src/
  App.jsx           Layout, polling, theme/sound prefs
  components/       Printer, Dials, Ticket, QrStage, Desk, Graveyard, Notice, Icons, …
  lib/              api client, Web Audio sfx, helpers
  index.css         The whole visual system
```
