import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// DELETE /api/admin/organisations/[id]/invitations/[token]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; token: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const result = await db.collection("organisation_invitations").deleteOne({
      organisationId: new ObjectId(params.id),
      token: params.token,
      status: "pending"
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
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