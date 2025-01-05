import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedMongoose: typeof mongoose | null = null;
let cachedMongoClient: MongoClient | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedMongoose) {
    return cachedMongoose;
  }

  cachedMongoose = await mongoose.connect(MONGODB_URI);
  return cachedMongoose;
}

export async function connectWithMongoClient(): Promise<MongoClient> {
  if (cachedMongoClient) {
    return cachedMongoClient;
  }

  cachedMongoClient = await MongoClient.connect(MONGODB_URI);
  return cachedMongoClient;
}

export default connectToDatabase;
