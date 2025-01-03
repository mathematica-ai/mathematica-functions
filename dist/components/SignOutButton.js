'use client';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
export default function SignOutButton() {
    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/' });
        }
        catch (error) {
            console.error('Sign out error:', error);
            toast.error('Failed to sign out');
        }
    };
    return (<button onClick={handleSignOut} className="btn btn-ghost btn-sm">
      Sign Out
    </button>);
}
