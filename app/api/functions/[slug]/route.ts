import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/functions/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await client.connect();
    const db = client.db();

    // Get all organizations the user is a member of
    const memberships = await db
      .collection("organisation_members")
      .find({ userId: session.user.id })
      .toArray();

    const organisationIds = memberships.map(m => m.organisationId);

    // Get the workflow by slug and verify organization access
    const workflow = await db
      .collection("workflows")
      .findOne({
        slug: params.slug,
        organisationId: { $in: organisationIds },
        status: "active"
      });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const response = {
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
      { status: 500 }
    );
  }
} 