'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { Organisation } from '@/types/models';

// Extend Organisation to match the Row type requirements
type OrganisationRow = Organisation & { id: string };

export default function OrganisationsPage() {
  const router = useRouter();
  const [organisations, setOrganisations] = useState<OrganisationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created At' }
  ];

  useEffect(() => {
    fetchOrganisations();
  }, []);

  async function fetchOrganisations() {
    try {
      const response = await fetch('/api/organisations');
      if (!response.ok) throw new Error('Failed to fetch organisations');
      const data: Organisation[] = await response.json();
      // Transform the data to include the id field required by DataTable
      const rowData = data.map(org => ({
        ...org,
        id: org._id // Map _id to id for DataTable compatibility
      }));
      setOrganisations(rowData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (row: OrganisationRow) => {
    router.push(`/dashboard/organisations/${row._id}`);
  };

  const handleDelete = async (row: OrganisationRow) => {
    if (!confirm('Are you sure you want to delete this organisation?')) return;

    try {
      const response = await fetch(`/api/organisations/${row._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete organisation');

      setOrganisations(orgs => orgs.filter(org => org._id !== row._id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Organisations</h1>
      <DataTable<OrganisationRow>
        data={organisations}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
} 