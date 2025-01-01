import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { sendMessageToLangflow } from "@/libs/langflow";
import type { ChatRequest } from "@/types/chat";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, history } = await req.json() as ChatRequest;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Send message and history to Langflow
    const langflowResponse = await sendMessageToLangflow(message, history || []);

    return NextResponse.json({
      message: langflowResponse.message,
      type: langflowResponse.type,
      data: langflowResponse.data
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 