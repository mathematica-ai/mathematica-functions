import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Mathematica Functions",
  description: "Admin dashboard for managing organizations, projects, workflows, and users.",
};

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Organisations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Organisations</h2>
          <p className="text-gray-600">Manage organisations and their settings</p>
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-gray-600">Manage projects across organizations</p>
        </div>

        {/* Workflows Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Workflows</h2>
          <p className="text-gray-600">Manage and monitor workflows</p>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-gray-600">Manage users and permissions</p>
        </div>
      </div>
    </div>
  );
} 