// Vercel entry point: every non-static request (API calls and /:code redirects)
// is rewritten here (see vercel.json) and handled by the Express app.
import app from '../server/src/app.js';
import { connectDB } from '../server/src/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'Database unavailable. Check MONGO_URI.' }));
  }
  return app(req, res);
}
