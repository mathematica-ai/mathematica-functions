import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

const client = new MongoClient(process.env.MONGODB_URI!);

// POST /api/invitations/[token]
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await client.connect();
    const db = client.db();

    // Find invitation
    const invitation = await db
      .collection("organisation_invitations")
      .findOne({
        token: params.token,
      });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.status === "expired" || invitation.expiresAt < new Date()) {
      // Update invitation status to expired if it's not already
      if (invitation.status !== "expired") {
        await db
          .collection("organisation_invitations")
          .updateOne(
            { _id: invitation._id },
            { $set: { status: "expired" } }
          );
      }
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Verify the invitation was sent to the logged-in user
    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Create organisation member
    const member = {
      organisationId: invitation.organisationId,
      userId: session.user.id,
      email: session.user.email.toLowerCase(),
      role: "member",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("organisation_members").insertOne(member);

    // Update invitation status
    await db
      .collection("organisation_invitations")
      .updateOne(
        { _id: invitation._id },
        { $set: { status: "accepted", acceptedAt: new Date() } }
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/invitations/[token]
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    await client.connect();
    const db = client.db();

    // Find invitation and include organisation details
    const invitation = await db
      .collection("organisation_invitations")
      .aggregate([
        {
          $match: {
            token: params.token,
          }
        },
        {
          $lookup: {
            from: "organisations",
            localField: "organisationId",
            foreignField: "_id",
            as: "organisation"
          }
        },
        {
          $unwind: "$organisation"
        }
      ])
      .next();

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.status === "expired" || invitation.expiresAt < new Date()) {
      // Update invitation status to expired if it's not already
      if (invitation.status !== "expired") {
        await db
          .collection("organisation_invitations")
          .updateOne(
            { _id: invitation._id },
            { $set: { status: "expired" } }
          );
      }
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: invitation.email,
      organisation: {
        id: invitation.organisation._id,
        name: invitation.organisation.name
      },
      status: invitation.status,
      expiresAt: invitation.expiresAt
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 