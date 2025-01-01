import NextAuth from "next-auth";
import { authOptions } from "@/libs/next-auth";

if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
