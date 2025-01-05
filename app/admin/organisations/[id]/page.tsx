'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

interface Organisation {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

interface Invitation {
  id: string;
  email: string;
}

export default function OrganisationPage() {
  const params = useParams();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganisation = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch organisation');
      const data = await response.json();
      setOrganisation(data);
    } catch (error) {
      toast.error('Failed to fetch organisation');
    }
  }, [params.id]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  }, [params.id]);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations`);
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      toast.error('Failed to fetch invitations');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrganisation();
    fetchMembers();
    fetchInvitations();
  }, [fetchOrganisation, fetchMembers, fetchInvitations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{organisation?.name || 'Organisation'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Members ({members.length})</h2>
            <ul className="space-y-2">
              {members.map((member: any) => (
                <li key={member.id} className="flex items-center justify-between">
                  <span>{member.name}</span>
                  <span className="badge">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Pending Invitations ({invitations.length})</h2>
            <ul className="space-y-2">
              {invitations.map((invitation: any) => (
                <li key={invitation.id} className="flex items-center justify-between">
                  <span>{invitation.email}</span>
                  <span className="badge badge-ghost">Pending</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 