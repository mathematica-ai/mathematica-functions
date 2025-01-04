import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { OrganisationInvitation, OrganisationInvitationResponse } from "@/types/models";

const client = new MongoClient(process.env.MONGODB_URI!);
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/admin/organisations/[id]/invitations
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Check if user is already a member
    const existingMember = await db
      .collection("organisation_members")
      .findOne({
        organisationId: new ObjectId(params.id),
        email: email.toLowerCase(),
        status: "active"
      });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organisation" },
        { status: 400 }
      );
    }

    // Check if there's a pending invitation
    const existingInvitation = await db
      .collection("organisation_invitations")
      .findOne({
        organisationId: new ObjectId(params.id),
        email: email.toLowerCase(),
        status: "pending"
      });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation token
    const token = randomBytes(32).toString('hex');
    const invitation: Omit<OrganisationInvitation, '_id'> = {
      organisationId: new ObjectId(params.id),
      email: email.toLowerCase(),
      token,
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    const result = await db.collection("organisation_invitations").insertOne(invitation);

    // Get base URL from environment variables
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invitations/${token}`;

    // Send invitation email
    await resend.emails.send({
      from: "Mathematica <onboarding@resend.dev>",
      to: email,
      subject: `Invitation to join ${organisation.name}`,
      html: `
        <h1>Organisation Invitation</h1>
        <p>You have been invited to join ${organisation.name}.</p>
        <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
      `,
      text: `You have been invited to join ${organisation.name}. Click here to accept: ${inviteUrl}`
    });

    const response: OrganisationInvitationResponse = {
      _id: result.insertedId.toString(),
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      organisationId: invitation.organisationId.toString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
}

// GET /api/admin/organisations/[id]/invitations
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    const invitations = await db
      .collection("organisation_invitations")
      .find({
        organisationId: new ObjectId(params.id),
        status: "pending"
      })
      .sort({ createdAt: -1 })
      .toArray();

    const response: OrganisationInvitationResponse[] = invitations.map(invitation => ({
      _id: invitation._id.toString(),
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      organisationId: invitation.organisationId.toString(),
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 