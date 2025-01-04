import { getServerSession } from "next-auth/next";
import { authOptions } from "./next-auth";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function isUserSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;

  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(session.user.id),
      role: "super-admin"
    });
    return !!user;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function requireSuperAdmin() {
  const isAdmin = await isUserSuperAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Super Admin access required");
  }
} 