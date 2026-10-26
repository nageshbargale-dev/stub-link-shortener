import mongoose from 'mongoose';

let memoryServer;
let connecting;

// Uses MONGO_URI when provided (local mongod or Atlas). Otherwise boots a
// throwaway in-memory MongoDB so the project runs with zero setup.
// Safe to call on every request: serverless hosts reuse warm instances.
export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  connecting ||= open().catch((err) => {
    connecting = undefined;
    throw err;
  });
  return connecting;
}

async function open() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.VERCEL) throw new Error('MONGO_URI is not set. Add it in the Vercel project settings.');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('stub');
    console.log('  ⚠  No MONGO_URI set — using an in-memory MongoDB (data resets on restart).');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`  ✓  MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
