'use client';

import React from 'react';
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SignInPage() {
  const handleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
} 