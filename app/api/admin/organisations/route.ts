import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/organisations
export async function GET(request: Request) {
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
    const user = await requireSuperAdmin();
    const { name, description } = await request.json();

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
    const existingOrg = await db
      .collection("organisations")
      .findOne({ slug });

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organisation with this name already exists" },
        { status: 400 }
      );
    }

    // Create organisation
    const organisation = {
      name,
      slug,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id
    };

    const result = await db.collection("organisations").insertOne(organisation);

    // Create organisation member record for the creator as owner
    const member = {
      organisationId: result.insertedId,
      userId: user.id,
      email: user.email,
      role: "owner",  // Creator becomes the owner
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("organisation_members").insertOne(member);

    return NextResponse.json({
      _id: result.insertedId,
      ...organisation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 