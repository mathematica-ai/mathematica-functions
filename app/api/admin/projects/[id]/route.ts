import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/projects/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch workflows for this project
    const workflows = await db
      .collection("workflows")
      .find({ projectId: new ObjectId(params.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ...project,
      workflows
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// PUT /api/admin/projects/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
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
    
    // Check if another project with same slug exists in this organisation
    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existingProject = await db
      .collection("projects")
      .findOne({
        organisationId: project.organisationId,
        slug,
        _id: { $ne: new ObjectId(params.id) }
      });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists in this organisation" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            name,
            slug,
            description,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: params.id,
      name,
      slug,
      description,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 