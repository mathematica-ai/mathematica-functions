import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// DELETE /api/admin/projects/[id]/workflows/[workflowId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; workflowId: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    // Check if workflow belongs to the project
    const workflow = await db
      .collection("workflows")
      .findOne({
        _id: new ObjectId(params.workflowId),
        projectId: new ObjectId(params.id)
      });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found in this project" },
        { status: 404 }
      );
    }

    // Delete the workflow
    const result = await db
      .collection("workflows")
      .deleteOne({
        _id: new ObjectId(params.workflowId),
        projectId: new ObjectId(params.id)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete workflow" },
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