import { connectToDatabase, connectWithMongoClient } from './mongo';

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

export async function withDatabase<T>(
  operation: (db: any) => Promise<T>
): Promise<T> {
  const connection = await connectToDatabase();
  try {
    return await operation(connection);
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
} 