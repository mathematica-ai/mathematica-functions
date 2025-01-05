import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export default async function FunctionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 