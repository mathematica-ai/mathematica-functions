import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import { OrganisationMemberResponse } from "@/types/models";

const client = new MongoClient(process.env.MONGODB_URI!);

// GET /api/admin/organisations/[id]/members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
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

    // Get all members of the organisation
    const members = await db
      .collection("organisation_members")
      .find({
        organisationId: new ObjectId(params.id)
      })
      .sort({ createdAt: -1 })
      .toArray();

    const response: OrganisationMemberResponse[] = members.map(member => ({
      _id: member._id.toString(),
      email: member.email,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      organisationId: member.organisationId.toString(),
      userId: member.userId.toString(),
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/organisations/[id]/members/[memberId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await requireSuperAdmin();
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

    // Check if member exists and belongs to the organisation
    const member = await db
      .collection("organisation_members")
      .findOne({
        _id: new ObjectId(params.memberId),
        organisationId: new ObjectId(params.id)
      });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Don't allow removing the owner
    if (member.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the organisation owner" },
        { status: 400 }
      );
    }

    // Remove the member
    await db.collection("organisation_members").deleteOne({
      _id: new ObjectId(params.memberId),
      organisationId: new ObjectId(params.id)
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 