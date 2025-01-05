'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Workflow {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkflow = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/workflows/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      const data = await response.json();
      setWorkflow(data);
    } catch (error) {
      toast.error('Failed to fetch workflow');
      router.push('/admin/projects');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Workflow Details</h1>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{workflow.name}</h2>
          <p>{workflow.description}</p>
          <div className="badge badge-primary">{workflow.status}</div>
          <div className="card-actions justify-end">
            <button 
              className="btn btn-primary"
              onClick={() => router.push(`/admin/workflows/${workflow._id}/edit`)}
            >
              Edit Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 