import { getServerSession } from "next-auth";
import { authOptions } from "./next-auth";

export async function isUserSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return session.user.role === "super-admin";
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const user = session.user;
  if (user.role !== "super-admin") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  return user;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  return session.user;
} 