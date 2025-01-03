import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateUniqueFileKey, generatePresignedUrl } from "@/libs/s3";
import { authOptions } from "@/libs/next-auth";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get file details from request
    const { filename, contentType } = await req.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique file key
    const fileKey = generateUniqueFileKey(filename);

    // Generate presigned URL
    const { uploadUrl, fileUrl } = await generatePresignedUrl(fileKey, contentType);

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      fileKey,
    });
  } catch (error: any) {
    console.error("Error in upload route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 