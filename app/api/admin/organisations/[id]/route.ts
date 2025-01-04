import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/organisations/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const organisation = await db
      .collection("organisations")
      .findOne({ _id: new ObjectId(params.id) });

    if (!organisation) {
      return NextResponse.json(
        { error: "Organisation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organisation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// PUT /api/admin/organisations/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Check if another organisation with same slug exists
    const existing = await db
      .collection("organisations")
      .findOne({
        slug,
        _id: { $ne: new ObjectId(params.id) }
      });

    if (existing) {
      return NextResponse.json(
        { error: "An organisation with this name already exists" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("organisations")
      .updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            name,
            slug,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Organisation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: params.id,
      name,
      slug,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/organisations/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const result = await db
      .collection("organisations")
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Organisation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 