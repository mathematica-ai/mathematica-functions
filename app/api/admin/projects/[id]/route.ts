import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";

const client = new MongoClient(process.env.MONGODB_URI!);

interface Project {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  organisationId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  organisationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/admin/projects/[id]
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();

    await client.connect();
    const db = client.db();

    const project = await db
      .collection<Project>("projects")
      .findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const response: ProjectResponse = {
      _id: project._id!.toString(),
      name: project.name,
      slug: project.slug,
      description: project.description,
      organisationId: project.organisationId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    return NextResponse.json(response);
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

    const project = await db
      .collection<Project>("projects")
      .findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const slug = slugify(name, { lower: true });

    // Check if another project with same slug exists in this organisation
    const existingProject = await db
      .collection("projects")
      .findOne({
        _id: { $ne: new ObjectId(params.id) },
        organisationId: project.organisationId,
        slug
      });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists in this organisation" },
        { status: 400 }
      );
    }

    const updatedProject: Partial<Project> = {
      name,
      slug,
      description,
      updatedAt: new Date(),
    };

    await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updatedProject }
      );

    const response: ProjectResponse = {
      _id: project._id!.toString(),
      name: updatedProject.name || project.name,
      slug: updatedProject.slug || project.slug,
      description: updatedProject.description || project.description,
      organisationId: project.organisationId.toString(),
      createdAt: project.createdAt,
      updatedAt: updatedProject.updatedAt || project.updatedAt
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/projects/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();

    await client.connect();
    const db = client.db();

    const result = await db
      .collection("projects")
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Project not found" },
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