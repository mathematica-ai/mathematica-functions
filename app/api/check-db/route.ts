import { NextResponse } from "next/server";
import { checkMongoConnection } from "@/libs/db-check";

export async function GET() {
  try {
    const result = await checkMongoConnection();
    return NextResponse.json(result);
  } catch (error) {
    console.error("DB check failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 