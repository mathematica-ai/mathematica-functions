import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { clientPromise } from "@/libs/mongoose";
import { connectWithMongoClient } from '@/libs/mongo';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const organizations = await db.collection('organizations').find().toArray();
  return NextResponse.json(organizations);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const client = await connectWithMongoClient();
  const db = client.db();
  const result = await db.collection('organizations').insertOne({ name, createdAt: new Date() });
  return NextResponse.json({ _id: result.insertedId, name, createdAt: new Date() });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const client = await connectWithMongoClient();
  const db = client.db();
  await db.collection('organizations').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
} 