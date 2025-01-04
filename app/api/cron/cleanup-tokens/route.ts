import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

// POST /api/cron/cleanup-tokens
export async function POST(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    if (process.env.VERCEL_ENV !== 'production' || request.headers.get('x-vercel-cron') !== 'true') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await client.connect();
    const db = client.db();

    // Delete expired verification tokens
    const verificationResult = await db
      .collection("verification_tokens")
      .deleteMany({
        expires: { $lt: new Date() }
      });

    // Delete expired organisation invitations
    const invitationResult = await db
      .collection("organisation_invitations")
      .deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() }, status: "pending" },
          { status: "expired" }
        ]
      });

    return NextResponse.json({
      success: true,
      deletedVerificationTokens: verificationResult.deletedCount,
      deletedInvitations: invitationResult.deletedCount
    });
  } catch (error: any) {
    console.error("Error cleaning up tokens:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 