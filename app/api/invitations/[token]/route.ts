import { NextResponse } from "next/server";
import { getInvitation } from "@/libs/db-utils";

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const invitation = await getInvitation(params.token);
    return NextResponse.json(invitation);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 