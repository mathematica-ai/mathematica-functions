import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";
import { clientPromise } from "@/libs/mongoose";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const organizations = await db.collection('organizations').find().toArray();
  return NextResponse.json(organizations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('organizations').insertOne({ name, createdAt: new Date() });
  return NextResponse.json(result.ops[0]);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('organizations').deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
} 