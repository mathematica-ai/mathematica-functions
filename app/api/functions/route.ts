import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/functions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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
      .find({ 
        email: session.user.email,
        status: "active"
      })
      .toArray();

    const organisationIds = memberships.map(m => new ObjectId(m.organisationId));

    // Get all active workflows from these organizations
    const workflows = await db
      .collection("workflows")
      .find({
        organisationId: { $in: organisationIds },
        status: "active"
      })
      .toArray();

    const response = workflows.map(workflow => ({
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
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in functions route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 