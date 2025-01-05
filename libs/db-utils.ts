import { connectToDatabase } from './mongo';
import mongoose from 'mongoose';

export async function getDatabase() {
  const connection = await connectToDatabase();
  return connection;
}

export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.connection.collection(collectionName);
}

export function convertToObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function getOrganisations() {
  const collection = await getCollection('organizations');
  return collection.find().toArray();
}

export async function getWorkflows(projectId: string) {
  const collection = await getCollection('workflows');
  return collection.find({ projectId: convertToObjectId(projectId) }).toArray();
}

export async function getInvitation(token: string) {
  const collection = await getCollection('invitations');
  return collection.findOne({ token });
}

export async function withDatabase<T>(callback: (db: mongoose.Connection) => Promise<T>): Promise<T> {
  const connection = await connectToDatabase();
  return callback(connection.connection);
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

export default {
  getDatabase,
  getCollection,
  convertToObjectId,
  getOrganisations,
  getWorkflows,
  getInvitation,
  withDatabase,
  executeWithRetry
}; 