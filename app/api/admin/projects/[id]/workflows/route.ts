import { NextResponse } from "next/server";
import { getWorkflows } from "@/libs/db-utils";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflows = await getWorkflows(params.id);
    return NextResponse.json(workflows);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 