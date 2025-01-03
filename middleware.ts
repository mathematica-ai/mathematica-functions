import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/prismicio";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const client = createClient();
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect /functions route
  if (request.nextUrl.pathname.startsWith('/functions')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Handle Prismic preview
  if (request.nextUrl.pathname === "/api/preview") {
    const { token: previewToken, documentId } = request.nextUrl.query;

    if (!previewToken) {
      return new Response("Missing token", { status: 401 });
    }

    try {
      const response = await client.enableDataToPreviews({
        token: previewToken as string,
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
  matcher: [
    "/api/preview",
    "/functions/:path*",
  ],
}; 