import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/arcadia';
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✓ [Database] Connected successfully to MongoDB:', mongoose.connection.host);
  } catch (err) {
    console.warn(`! [Database] Could not connect to primary MongoDB (${err.message}).`);
    console.log('➜ [Database] Initializing fallback in-memory MongoDB server for standalone local demo...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log('✓ [Database] Connected to fallback In-Memory MongoDB:', memoryUri);
    } catch (memErr) {
      console.error('✗ [Database] Failed to initialize in-memory MongoDB fallback:', memErr.message);
      console.error('Please ensure MongoDB is running or provide a valid MONGODB_URI in .env');
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (err) {
    console.error('[Database] Error disconnecting from MongoDB:', err);
  }
};
