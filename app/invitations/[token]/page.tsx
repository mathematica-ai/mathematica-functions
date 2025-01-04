'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface InvitationDetails {
  email: string;
  organisation: {
    id: string;
    name: string;
  };
}

export default function InvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${params.token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch invitation');
        }
        const data = await response.json();
        setInvitation(data);
      } catch (error: any) {
        toast.error(error.message);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [params.token, router]);

  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      const response = await fetch(`/api/invitations/${params.token}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast.success('Invitation accepted successfully');
      router.push('/functions');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAccepting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Sign in Required</h1>
          <p>Please sign in to accept the invitation.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Organisation Invitation</h1>
        <div className="space-y-4">
          <p>
            You have been invited to join{' '}
            <span className="font-semibold">{invitation.organisation.name}</span>
          </p>
          {session.user?.email?.toLowerCase() !== invitation.email.toLowerCase() ? (
            <div className="alert alert-error">
              <p>
                This invitation was sent to {invitation.email}. Please sign in with
                that email address to accept the invitation.
              </p>
            </div>
          ) : (
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="btn btn-primary"
            >
              {accepting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Accept Invitation'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 