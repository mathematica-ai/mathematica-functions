'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Organisation {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const router = useRouter();

  const fetchOrganisations = async () => {
    try {
      const response = await fetch('/api/admin/organisations');
      if (!response.ok) throw new Error('Failed to fetch organisations');
      const data = await response.json();
      setOrganisations(data);
    } catch (error) {
      toast.error('Failed to fetch organisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisations();
  }, []); // Fetch when component mounts

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create organisation');
      }

      toast.success('Organisation created successfully');
      setShowCreateModal(false);
      setNewOrgName('');
      fetchOrganisations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organisation?')) return;

    try {
      const response = await fetch(`/api/admin/organisations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete organisation');

      toast.success('Organisation deleted successfully');
      fetchOrganisations();
    } catch (error) {
      toast.error('Failed to delete organisation');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organisations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          Create Organisation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organisations.map((org) => (
                <tr key={org._id}>
                  <td>{org.name}</td>
                  <td>{org.slug}</td>
                  <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => router.push(`/admin/organisations/${org._id}`)}
                      className="btn btn-sm btn-ghost mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(org._id)}
                      className="btn btn-sm btn-error btn-outline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {organisations.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No organisations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Organisation</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Organisation Name</span>
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
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
} 