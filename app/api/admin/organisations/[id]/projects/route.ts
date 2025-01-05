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

// POST /api/admin/organisations/[id]/projects
export async function POST(
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

    // Check if organisation exists
    const organisation = await db
      .collection("organisations")
      .findOne({ _id: new ObjectId(params.id) });

    if (!organisation) {
      return NextResponse.json(
        { error: "Organisation not found" },
        { status: 404 }
      );
    }

    const slug = slugify(name, { lower: true });
    
    // Check if project with same slug exists in this organisation
    const existingProject = await db
      .collection("projects")
      .findOne({
        organisationId: new ObjectId(params.id),
        slug
      });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists in this organisation" },
        { status: 400 }
      );
    }

    // Create new project
    const project: Omit<Project, '_id'> = {
      name,
      slug,
      description,
      organisationId: new ObjectId(params.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("projects").insertOne(project);

    const response: ProjectResponse = {
      _id: result.insertedId.toString(),
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