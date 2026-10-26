import mongoose from 'mongoose';

const MAX_VISITS_KEPT = 200;
const RECENT_VISITS_SHOWN = 6;

// Keep in sync with client/src/lib/options.js.
export const STAMPS = ['shortened', 'urgent', 'top-secret', 'with-love', 'approved', 'fragile'];
export const INKS = ['vermilion', 'cobalt', 'forest', 'carbon'];

// Self-destruct presets: either a click budget or a lifetime.
export const DESTRUCT = {
  '1c': { maxClicks: 1 },
  '10c': { maxClicks: 10 },
  '100c': { maxClicks: 100 },
  '1h': { ms: 3_600_000 },
  '1d': { ms: 86_400_000 },
  '7d': { ms: 7 * 86_400_000 },
};

// Sequential "ticket numbers" — purely for the printed-ticket look.
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
export const Counter = mongoose.model('Counter', counterSchema);

export async function nextTicketNo() {
  const c = await Counter.findByIdAndUpdate(
    'ticket',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return c.seq;
}

const visitSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    referrer: { type: String, default: '' },
    device: { type: String, enum: ['phone', 'desktop'], default: 'desktop' },
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    owner: { type: String, required: true, index: true },
    ticketNo: { type: Number, required: true },
    custom: { type: Boolean, default: false },
    stamp: { type: String, enum: STAMPS, default: 'shortened' },
    ink: { type: String, enum: INKS, default: 'vermilion' },
    clicks: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: null },
    visits: { type: [visitSchema], default: [] },
    // Self-destruct: bury after this many clicks, or at this moment.
    maxClicks: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    // Soft delete: buried links live on in the Link Graveyard.
    buriedAt: { type: Date, default: null },
    buriedReason: { type: String, enum: ['manual', 'clicks', 'time', null], default: null },
  },
  { timestamps: true }
);

linkSchema.statics.recordVisit = async function (code, referrer = '', device = 'desktop') {
  const now = new Date();
  const link = await this.findOneAndUpdate(
    { code, buriedAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
    {
      $inc: { clicks: 1 },
      $set: { lastClickedAt: now },
      $push: { visits: { $each: [{ referrer, device }], $slice: -MAX_VISITS_KEPT } },
    },
    { returnDocument: 'after' }
  );
  // The click that spends the last of the budget still gets through; then the link is buried.
  if (link?.maxClicks && link.clicks >= link.maxClicks) {
    await this.updateOne({ _id: link._id, buriedAt: null }, { $set: { buriedAt: now, buriedReason: 'clicks' } });
  }
  return link;
};

// Lazily bury links whose time is up. Cheap enough to run before every read.
linkSchema.statics.buryExpired = function (filter = {}) {
  const now = new Date();
  return this.updateMany(
    { ...filter, buriedAt: null, expiresAt: { $ne: null, $lte: now } },
    { $set: { buriedAt: now, buriedReason: 'time' } }
  );
};

linkSchema.methods.toPublic = function (baseUrl) {
  return {
    code: this.code,
    url: this.url,
    shortUrl: `${baseUrl}/${this.code}`,
    ticketNo: this.ticketNo,
    custom: this.custom,
    stamp: this.stamp,
    ink: this.ink,
    clicks: this.clicks,
    maxClicks: this.maxClicks,
    expiresAt: this.expiresAt,
    lastClickedAt: this.lastClickedAt,
    createdAt: this.createdAt,
    buriedAt: this.buriedAt,
    buriedReason: this.buriedReason,
    // Clicks per day for the last 7 days (oldest → newest).
    week: weekHistogram(this.visits),
    // Newest first, referrer reduced to its host.
    recent: this.visits
      .slice(-RECENT_VISITS_SHOWN)
      .reverse()
      .map((v) => ({ at: v.at, from: hostOf(v.referrer), device: v.device })),
  };
};

function hostOf(url) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : '';
  } catch {
    return '';
  }
}

const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

function weekHistogram(visits) {
  const days = Array(7).fill(0);
  const today = dayStart(new Date());
  for (const v of visits) {
    const daysAgo = Math.round((today - dayStart(v.at)) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) days[6 - daysAgo]++;
  }
  return days;
}

export const Link = mongoose.model('Link', linkSchema);
