import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { createClient } from "./prismicio";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect /functions route
  if (request.nextUrl.pathname.startsWith('/functions')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Allow the request to continue
    return NextResponse.next();
  }

  // Handle Prismic preview
  if (request.nextUrl.pathname === "/api/preview") {
    const client = createClient();
    return redirectToPreviewURL({ client, request });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/preview",
    "/functions/:path*",
  ],
}; 