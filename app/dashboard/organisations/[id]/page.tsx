'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { apiService } from '@/libs/apiService';
import type { OrganisationCreate } from '@/types/organisation';

export default function OrganisationForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [form, setForm] = useState<OrganisationCreate>({
    name: '',
    address: '',
  });

  useEffect(() => {
    if (!isNew) {
      loadOrganisation();
    }
  }, [isNew, params.id]);

  const loadOrganisation = async () => {
    try {
      const response = await apiService.organisations.get(params.id);
      const { id, ...formData } = response.data;
      setForm(formData);
    } catch (error) {
      console.error('Failed to load organisation:', error);
      toast.error('Failed to load organisation');
      router.push('/dashboard/organisations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        await apiService.organisations.create(form);
        toast.success('Organisation created successfully');
      } else {
        await apiService.organisations.update(params.id, form);
        toast.success('Organisation updated successfully');
      }
      router.push('/dashboard/organisations');
    } catch (error) {
      console.error('Failed to save organisation:', error);
      toast.error('Failed to save organisation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? 'Create Organisation' : 'Edit Organisation'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Address</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input input-bordered"
            required
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 