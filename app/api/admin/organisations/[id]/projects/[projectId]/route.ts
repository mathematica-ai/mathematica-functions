import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// DELETE /api/admin/organisations/[id]/projects/[projectId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    // Check if project belongs to the organisation
    const project = await db
      .collection("projects")
      .findOne({
        _id: new ObjectId(params.projectId),
        organisationId: new ObjectId(params.id)
      });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found in this organisation" },
        { status: 404 }
      );
    }

    // Delete the project
    const result = await db
      .collection("projects")
      .deleteOne({
        _id: new ObjectId(params.projectId),
        organisationId: new ObjectId(params.id)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
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