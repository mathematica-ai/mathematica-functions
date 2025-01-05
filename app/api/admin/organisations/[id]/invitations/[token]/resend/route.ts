import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireSuperAdmin } from "@/libs/auth";
import { Resend } from "resend";

const client = new MongoClient(process.env.MONGODB_URI!);
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/admin/organisations/[id]/invitations/[token]/resend
export async function POST(
  request: Request,
  { params }: { params: { id: string; token: string } }
) {
  try {
    await requireSuperAdmin();
    await client.connect();
    const db = client.db();

    // Find the invitation and organisation
    const [invitation, organisation] = await Promise.all([
      db.collection("organisation_invitations").findOne({
        organisationId: new ObjectId(params.id),
        token: params.token,
        status: "pending"
      }),
      db.collection("organisations").findOne({
        _id: new ObjectId(params.id)
      })
    ]);

    if (!invitation || !organisation) {
      return NextResponse.json(
        { error: "Invitation or organisation not found" },
        { status: 404 }
      );
    }

    // Update invitation expiry
    await db.collection("organisation_invitations").updateOne(
      { _id: invitation._id },
      {
        $set: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          updatedAt: new Date()
        }
      }
    );

    // Get base URL from environment variables
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invitations/${invitation.token}`;

    // Resend invitation email
    await resend.emails.send({
      from: "Mathematica <onboarding@resend.dev>",
      to: invitation.email,
      subject: `Invitation to join ${organisation.name} (Resent)`,
      html: `
        <h1>Organisation Invitation</h1>
        <p>You have been invited to join ${organisation.name}.</p>
        <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
      `,
      text: `You have been invited to join ${organisation.name}. Click here to accept: ${inviteUrl}`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized: Super Admin access required" ? 401 : 500 }
    );
  }
} 