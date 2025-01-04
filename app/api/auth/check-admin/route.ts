import { NextResponse } from "next/server";
import { isUserSuperAdmin } from "@/libs/auth";

export async function GET() {
  try {
    const isAdmin = await isUserSuperAdmin();
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
} 