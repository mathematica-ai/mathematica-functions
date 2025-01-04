import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isUserSuperAdmin } from "@/libs/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isSuperAdmin = await isUserSuperAdmin();

  if (!isSuperAdmin) {
    redirect("/functions");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <nav className="space-y-2">
          <Link 
            href="/admin/organisations" 
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Organisations
          </Link>
          <Link 
            href="/admin/projects" 
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Projects
          </Link>
          <Link 
            href="/admin/workflows" 
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Workflows
          </Link>
          <Link 
            href="/admin/users" 
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Users
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
} 