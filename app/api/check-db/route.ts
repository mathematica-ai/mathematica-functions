import { NextResponse } from "next/server";
import { connectToDatabase } from "@/libs/mongo";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: "ok", message: "Database connection successful" });
  } catch (error) {
    console.error("DB check failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 