import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// AWS DocumentDB Configuration
const connectionOptions = {
  ssl: true,
  replicaSet: 'rs0',
  readPreference: 'secondaryPreferred',
  retryWrites: false,
  tls: true,
  tlsCAFile: `${process.cwd()}/certs/rds-combined-ca-bundle.pem`,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// Cache the database connection
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    // Connect to MongoDB/DocumentDB
    const connection = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log('New database connection established');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Alternative connection method using MongoClient (if needed)
let cachedClient: MongoClient | null = null;

async function connectWithMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, connectionOptions);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoClient connection error:', error);
    throw error;
  }
}

export { connectToDatabase as default, connectWithMongoClient };
