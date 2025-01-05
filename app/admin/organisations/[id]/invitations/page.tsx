'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from "next/navigation";
import { PlusIcon, EnvelopeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { OrganisationInvitationResponse } from "@/types/models";

export default function InvitationsPage() {
  const params = useParams();
  const [invitations, setInvitations] = useState<OrganisationInvitationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const data = await response.json();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  async function handleResend(token: string) {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations/${token}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }
      
      // Show success message or update UI
      alert('Invitation resent successfully');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(token: string) {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations/${token}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invitation');
      }
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.token !== token));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Invitations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Invite User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation._id}>
                <td>{invitation.email}</td>
                <td>
                  <span className="badge badge-warning">
                    {invitation.status}
                  </span>
                </td>
                <td>{new Date(invitation.createdAt).toLocaleDateString()}</td>
                <td>{new Date(invitation.expiresAt).toLocaleDateString()}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => handleResend(invitation.token)}
                    className="btn btn-sm btn-ghost"
                    title="Resend invitation"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(invitation.token)}
                    className="btn btn-sm btn-ghost text-error"
                    title="Delete invitation"
                  >
                    <TrashIcon className="h-4 w-4" />
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
            <h3 className="font-bold text-lg">Invite User</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Send Invitation</button>
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
    const email = formData.get('email') as string;

    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      setShowCreateModal(false);
      fetchInvitations();
    } catch (err: any) {
      setError(err.message);
    }
  }
} 