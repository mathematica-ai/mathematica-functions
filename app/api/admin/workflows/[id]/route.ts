import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import { WorkflowResponse } from "@/types/models";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/workflows/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const workflow = await db
      .collection("workflows")
      .findOne({ _id: new ObjectId(params.id) });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const response: WorkflowResponse = {
      _id: workflow._id.toString(),
      workflow_id: workflow.workflow_id,
      name: workflow.name,
      slug: workflow.slug,
      description: workflow.description,
      status: workflow.status,
      projectId: workflow.projectId.toString(),
      organisationId: workflow.organisationId.toString(),
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// PUT /api/admin/workflows/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    const { name, description, status, workflow_id } = await request.json();

    if (!name || !workflow_id) {
      return NextResponse.json(
        { error: "Name and Workflow ID are required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();

    // Check if workflow exists
    const workflow = await db
      .collection("workflows")
      .findOne({ _id: new ObjectId(params.id) });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Check if workflow_id is already in use by another workflow
    if (workflow_id !== workflow.workflow_id) {
      const existingWorkflow = await db
        .collection("workflows")
        .findOne({
          _id: { $ne: new ObjectId(params.id) },
          workflow_id
        });

      if (existingWorkflow) {
        return NextResponse.json(
          { error: "Workflow ID is already in use" },
          { status: 400 }
        );
      }
    }

    // Update workflow
    const result = await db.collection("workflows").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          description,
          status,
          workflow_id,
          updatedAt: new Date(),
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No changes were made" },
        { status: 400 }
      );
    }

    // Get updated workflow
    const updatedWorkflow = await db
      .collection("workflows")
      .findOne({ _id: new ObjectId(params.id) });

    if (!updatedWorkflow) {
      return NextResponse.json(
        { error: "Failed to retrieve updated workflow" },
        { status: 500 }
      );
    }

    const response: WorkflowResponse = {
      _id: updatedWorkflow._id.toString(),
      workflow_id: updatedWorkflow.workflow_id,
      name: updatedWorkflow.name,
      slug: updatedWorkflow.slug,
      description: updatedWorkflow.description,
      status: updatedWorkflow.status,
      projectId: updatedWorkflow.projectId.toString(),
      organisationId: updatedWorkflow.organisationId.toString(),
      createdAt: updatedWorkflow.createdAt,
      updatedAt: updatedWorkflow.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 