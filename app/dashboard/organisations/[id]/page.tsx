'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

interface Organisation {
  _id: string;
  name: string;
  description: string;
}

export default function OrganisationPage() {
  const params = useParams();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrganisation = useCallback(async () => {
    try {
      const response = await fetch(`/api/organisations/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch organisation');
      const data = await response.json();
      setOrganisation(data);
    } catch (error) {
      toast.error('Failed to fetch organisation');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadOrganisation();
  }, [loadOrganisation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!organisation) {
    return <div>Organisation not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{organisation.name}</h1>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <p>{organisation.description}</p>
        </div>
      </div>
    </div>
  );
} 