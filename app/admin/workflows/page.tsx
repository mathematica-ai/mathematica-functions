'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { WorkflowResponse } from "@/types/models";

interface Project {
  _id: string;
  name: string;
  description?: string;
  organisationId: string;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      // First, get all projects
      const projectsResponse = await fetch('/api/admin/projects');
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projects = await projectsResponse.json();
      setProjects(projects);

      // Then, get workflows for each project
      const allWorkflows = [];
      for (const project of projects) {
        const response = await fetch(`/api/admin/projects/${project._id}/workflows`);
        if (response.ok) {
          const workflows = await response.json();
          allWorkflows.push(...workflows.map((w: WorkflowResponse) => ({ ...w, projectId: project._id })));
        }
      }
      setWorkflows(allWorkflows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Workflow
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Project</th>
              <th>Organisation</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow) => (
              <tr key={workflow._id}>
                <td className="font-mono text-sm">{workflow.workflow_id}</td>
                <td>{workflow.name}</td>
                <td>
                  <span className={`badge ${workflow.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {workflow.status}
                  </span>
                </td>
                <td>{workflow.projectId}</td>
                <td>{workflow.organisationId}</td>
                <td>{new Date(workflow.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => router.push(`/admin/workflows/${workflow._id}`)}
                    className="btn btn-sm btn-ghost"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Workflow</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Create</button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const projectId = formData.get('projectId') as string;

    if (!projectId) {
      setError('Project is required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      setShowCreateModal(false);
      fetchWorkflows();
    } catch (err: any) {
      setError(err.message);
    }
  }
} 