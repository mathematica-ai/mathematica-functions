'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      toast.error('Failed to fetch project');
      router.push('/admin/organisations');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Project Details</h1>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{project.name}</h2>
          <p>{project.description}</p>
          <div className="card-actions justify-end">
            <button 
              className="btn btn-primary"
              onClick={() => router.push(`/admin/projects/${project._id}/edit`)}
            >
              Edit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 