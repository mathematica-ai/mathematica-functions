'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Organisation } from "@/types/models";
import { getAllOrganisations } from "@/services/organisationService";

export default function OrganisationsPage() {
  const { data: session } = useSession();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const data = await getAllOrganisations();
        setOrganisations(data);
      } catch (error) {
        console.error('Error fetching organisations:', error);
      }
    };

    fetchOrganisations();
  }, []);

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <Link href="/admin/organisations/new" className="btn btn-primary">
          New Organisation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organisations.map((org) => (
          <Link
            key={org._id}
            href={`/admin/organisations/${org._id}`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h2 className="card-title">{org.name}</h2>
              <p className="text-sm text-gray-500">{org.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 