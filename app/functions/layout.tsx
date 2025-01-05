import { Metadata } from "next";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { connectWithMongoClient } from "@/libs/mongo";

export const metadata: Metadata = {
  title: "Functions | Mathematica",
  description: "Mathematica Functions",
};

export default async function FunctionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // Verify user exists and is active
  const client = await connectWithMongoClient();
  const db = client.db();
  
  const user = await db.collection("users").findOne({
    email: session.user.email,
    emailVerified: { $ne: null }
  });

  if (!user) {
    return redirect("/auth/signin");
  }

  // Check if user is a member of any organization
  const membership = await db.collection("organisation_members").findOne({
    userId: session.user.id,
    status: "active"
  });

  if (!membership) {
    return redirect("/auth/signin?error=no_organization");
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 