'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { WorkflowResponse } from "@/types/models";

export default function WorkflowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWorkflow();
  }, []);

  async function fetchWorkflow() {
    try {
      const response = await fetch(`/api/admin/workflows/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      const data = await response.json();
      setWorkflow(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch workflow');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!workflow) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/workflows/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflow.workflow_id,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          slug: workflow.slug,
          projectId: workflow.projectId,
          organisationId: workflow.organisationId
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update workflow');
      }
      
      const updatedWorkflow = await response.json();
      setWorkflow(updatedWorkflow);
      toast.success('Workflow updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update workflow');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workflow Details</h1>
        <button
          onClick={() => router.push('/admin/workflows')}
          className="btn btn-ghost"
        >
          Back to Workflows
        </button>
      </div>

      {/* Workflow Details Form */}
      <div className="max-w-2xl mb-8">
        <form onSubmit={handleUpdateWorkflow} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Workflow ID</span>
            </label>
            <input
              type="text"
              value={workflow.workflow_id}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, workflow_id: e.target.value } : null)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={workflow.description || ''}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              value={workflow.status}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' } : null)}
              className="select select-bordered"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Slug</span>
            </label>
            <input
              type="text"
              value={workflow.slug}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Created At</span>
            </label>
            <input
              type="text"
              value={new Date(workflow.createdAt).toLocaleString()}
              className="input input-bordered"
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 