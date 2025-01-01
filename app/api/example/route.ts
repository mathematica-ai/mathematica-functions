import { withDatabase, executeWithRetry } from '@/libs/db-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await withDatabase(async (db) => {
      return await executeWithRetry(async () => {
        // Your database query here
        const collection = db.collection('your_collection');
        return await collection.find().toArray();
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 