'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Organisation {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditOrganisationPage({
  params,
}: {
  params: { id: string };
}) {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrganisation = async () => {
      try {
        const response = await fetch(`/api/admin/organisations/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch organisation');
        
        const data = await response.json();
        setOrganisation(data);
        setName(data.name);
      } catch (error) {
        toast.error('Failed to fetch organisation');
        router.push('/admin/organisations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisation();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to update organisation');

      toast.success('Organisation updated successfully');
      router.push('/admin/organisations');
    } catch (error) {
      toast.error('Failed to update organisation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!organisation) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Organisation</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Organisation Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Slug</span>
            </label>
            <input
              type="text"
              value={organisation.slug}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/organisations')}
              className="btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 