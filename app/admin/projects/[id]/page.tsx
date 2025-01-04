'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  organisationId: string;
  createdAt: string;
  updatedAt: string;
  workflows?: Workflow[];
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    status: 'inactive' as const,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        
        const data = await response.json();
        setProject(data);
      } catch (error) {
        toast.error('Failed to fetch project');
        router.push('/admin/organisations');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          description: project.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to update project');

      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create workflow');
      }

      toast.success('Workflow created successfully');
      setShowWorkflowModal(false);
      setNewWorkflow({ name: '', description: '', status: 'inactive' });
      
      // Refresh project data
      const projectResponse = await fetch(`/api/admin/projects/${params.id}`);
      const projectData = await projectResponse.json();
      setProject(projectData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${params.id}/workflows/${workflowId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete workflow');

      toast.success('Workflow deleted successfully');
      
      // Refresh project data
      const projectResponse = await fetch(`/api/admin/projects/${params.id}`);
      const projectData = await projectResponse.json();
      setProject(projectData);
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Details</h1>
        <button
          onClick={() => router.push(`/admin/organisations/${project.organisationId}`)}
          className="btn btn-ghost"
        >
          Back to Organisation
        </button>
      </div>

      <div className="max-w-2xl mb-8">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Project Name</span>
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={project.description || ''}
              onChange={(e) => setProject(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Slug</span>
            </label>
            <input
              type="text"
              value={project.slug}
              className="input input-bordered"
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>

      {/* Workflows Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workflows</h2>
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="btn btn-primary btn-sm"
          >
            Create Workflow
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.workflows?.map((workflow) => (
                <tr key={workflow._id}>
                  <td>{workflow.name}</td>
                  <td>{workflow.description}</td>
                  <td>
                    <span className={`badge ${workflow.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {workflow.status}
                    </span>
                  </td>
                  <td>{new Date(workflow.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => router.push(`/admin/workflows/${workflow._id}`)}
                      className="btn btn-sm btn-ghost mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow._id)}
                      className="btn btn-sm btn-error btn-outline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(!project.workflows || project.workflows.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No workflows found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showWorkflowModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Workflow</h3>
            <form onSubmit={handleCreateWorkflow}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Workflow Name</span>
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea textarea-bordered"
                  rows={3}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  value={newWorkflow.status}
                  onChange={(e) => setNewWorkflow(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'active' | 'inactive'
                  }))}
                  className="select select-bordered"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowWorkflowModal(false)}
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
} 