import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/prismicio";
import { redirectToPreviewURL, setPreviewData } from "@prismicio/next";

export async function middleware(request: NextRequest) {
  const client = createClient();

  if (request.nextUrl.pathname === "/api/preview") {
    const { token, documentId } = request.nextUrl.query;

    if (!token) {
      return new Response("Missing token", { status: 401 });
    }

    try {
      const response = await client.enableDataToPreviews({
        token: token as string,
        documentId: documentId as string,
      });

      return response;
    } catch (error) {
      return new Response("Invalid token", { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/preview"],
}; 