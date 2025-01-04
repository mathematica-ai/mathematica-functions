import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/organisations
export async function GET() {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();
    
    const organisations = await db
      .collection("organisations")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(organisations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// POST /api/admin/organisations
export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();

    const slug = slugify(name, { lower: true });
    
    // Check if organisation with same slug exists
    const existing = await db
      .collection("organisations")
      .findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { error: "An organisation with this name already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection("organisations").insertOne({
      name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      _id: result.insertedId,
      name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 