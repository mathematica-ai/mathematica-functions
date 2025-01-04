'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlusIcon, EnvelopeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { OrganisationInvitationResponse, OrganisationMemberResponse } from "@/types/models";
import { toast } from "react-hot-toast";

interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

interface Organisation {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  projects?: Project[];
}

export default function OrganisationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [invitations, setInvitations] = useState<OrganisationInvitationResponse[]>([]);
  const [members, setMembers] = useState<OrganisationMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrganisation();
    fetchInvitations();
    fetchMembers();
  }, []);

  async function fetchOrganisation() {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch organisation');
      }
      const data = await response.json();
      setOrganisation(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch organisation');
    }
  }

  async function fetchInvitations() {
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
  }

  async function fetchMembers() {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdateOrganisation(e: React.FormEvent) {
    e.preventDefault();
    if (!organisation) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/organisations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: organisation.name,
          description: organisation.description,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update organisation');
      
      toast.success('Organisation updated successfully');
    } catch (error) {
      toast.error('Failed to update organisation');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResend(token: string) {
    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/invitations/${token}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }
      
      toast.success('Invitation resent successfully');
    } catch (err: any) {
      toast.error(err.message);
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
      
      setInvitations(invitations.filter(inv => inv.token !== token));
      toast.success('Invitation deleted successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organisations/${params.id}/members/${memberId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      
      setMembers(members.filter(member => member._id !== memberId));
      toast.success('Member removed successfully');
    } catch (err: any) {
      toast.error(err.message);
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

  if (!organisation) {
    return <div>Organisation not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organisation Details</h1>
        <button
          onClick={() => router.push('/admin/organisations')}
          className="btn btn-ghost"
        >
          Back to Organisations
        </button>
      </div>

      {/* Organisation Details Form */}
      <div className="max-w-2xl mb-8">
        <form onSubmit={handleUpdateOrganisation} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Organisation Name</span>
            </label>
            <input
              type="text"
              value={organisation.name}
              onChange={(e) => setOrganisation(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={organisation.description || ''}
              onChange={(e) => setOrganisation(prev => prev ? { ...prev, description: e.target.value } : null)}
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
              value={organisation.slug}
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

      {/* Members Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Members</h2>
        </div>

        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>{member.email}</td>
                  <td>
                    <span className={`badge ${member.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="btn btn-sm btn-ghost text-error"
                      title="Remove member"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Invite User
          </button>
        </div>

        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
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
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No pending invitations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            onClick={() => router.push(`/admin/organisations/${params.id}/projects/new`)}
            className="btn btn-primary btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Project
          </button>
        </div>

        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organisation.projects?.map((project) => (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => router.push(`/admin/projects/${project._id}`)}
                      className="btn btn-sm btn-ghost"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {(!organisation.projects || organisation.projects.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Invite User</h3>
            <form onSubmit={handleInvite}>
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
                  onClick={() => setShowInviteModal(false)}
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

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
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

      setShowInviteModal(false);
      fetchInvitations(); // Refresh the invitations list
      toast.success('Invitation sent successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  }
} 