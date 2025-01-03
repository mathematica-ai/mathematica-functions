import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { MongoClient } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return Response.json({ verified: false }, { status: 401 });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    
    try {
      await client.connect();
      const db = client.db("functions");
      
      const user = await db.collection('users').findOne({ 
        email: token.email,
        emailVerified: { $ne: null }
      });

      if (!user) {
        return Response.json({ verified: false }, { status: 401 });
      }

      return Response.json({ verified: true });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
} 