import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import slugify from "slugify";
import { Workflow, WorkflowResponse } from "@/types/models";

const client = new MongoClient(process.env.MONGODB_URI!);

// Helper function to generate workflow ID
async function generateWorkflowId(db: any, projectId: ObjectId): Promise<string> {
  // Get the count of existing workflows in this project
  const count = await db.collection("workflows").countDocuments({ projectId });
  
  // Format: WF-{projectLastTwoChars}-{count+1}
  const projectIdStr = projectId.toString();
  const projectSuffix = projectIdStr.slice(-2).toUpperCase();
  const number = (count + 1).toString().padStart(3, '0');
  
  return `WF-${projectSuffix}-${number}`;
}

// POST /api/admin/projects/[id]/workflows
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    const { name, description, status } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();

    // Check if project exists
    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const slug = slugify(name, { lower: true });
    
    // Check if workflow with same slug exists in this project
    const existingWorkflow = await db
      .collection("workflows")
      .findOne({
        projectId: new ObjectId(params.id),
        slug
      });

    if (existingWorkflow) {
      return NextResponse.json(
        { error: "A workflow with this name already exists in this project" },
        { status: 400 }
      );
    }

    // Generate workflow ID
    const workflow_id = await generateWorkflowId(db, new ObjectId(params.id));

    // Create new workflow
    const workflow: Omit<Workflow, '_id'> = {
      workflow_id,
      name,
      slug,
      description,
      status: status || 'inactive',
      projectId: new ObjectId(params.id),
      organisationId: project.organisationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("workflows").insertOne(workflow);

    const response: WorkflowResponse = {
      _id: result.insertedId.toString(),
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