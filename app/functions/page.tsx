'use client';

import { useEffect, useState, useCallback } from 'react';
import { WorkflowResponse } from '@/types/models';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FunctionsPage() {
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSession();
  const router = useRouter();

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch('/api/functions', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchWorkflows();
    }
  }, [status, router, fetchWorkflows]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Functions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Link 
            key={workflow._id} 
            href={`/functions/${workflow.slug}`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h2 className="card-title">{workflow.name}</h2>
              <p className="text-sm text-gray-500">ID: {workflow.workflow_id}</p>
              {workflow.description && (
                <p className="text-gray-600">{workflow.description}</p>
              )}
              <div className="card-actions justify-end mt-4">
                <span className={`badge ${workflow.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {workflow.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No functions available</p>
        </div>
      )}
    </div>
  );
} 