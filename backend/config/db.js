import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('<') || uri.includes('>');

  if (!isPlaceholder) {
    try {
      console.log(`[Attempting MongoDB Connection to ${uri.split('@')[1] || uri}]...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);

      // Auto-seed if newly created Atlas database
      const { autoSeedIfEmpty } = await import('../seeder.js');
      if (autoSeedIfEmpty) {
        await autoSeedIfEmpty();
      }

      return conn;
    } catch (err) {
      console.warn(`[MongoDB Atlas connection failed]: ${err.message}`);
      console.log('[Tip: Ensure IP Address 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access]');
      console.log('[Switching to built-in development In-Memory MongoDB server...]');
    }
  } else {
    console.log('[No valid remote MongoDB URI in .env - Using local In-Memory MongoDB...]');
  }

  try {
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Local In-Memory MongoDB Connected successfully]: ${memoryUri}`);

    // Automatically seed default data for demonstration
    const { autoSeedIfEmpty } = await import('../seeder.js');
    if (autoSeedIfEmpty) {
      await autoSeedIfEmpty();
    }

    return conn;
  } catch (error) {
    console.error(`[MongoDB Initialization Error]: ${error.message}`);
  }
};

export default connectDB;
