'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const getErrorMessage = (error) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'You do not have permission to sign in.';
            case 'Verification':
                return 'The verification token has expired or has already been used.';
            case 'OAuthSignin':
                return 'Error in constructing an authorization URL.';
            case 'OAuthCallback':
                return 'Error in handling the response from an OAuth provider.';
            case 'OAuthCreateAccount':
                return 'Could not create OAuth provider user in the database.';
            case 'EmailCreateAccount':
                return 'Could not create email provider user in the database.';
            case 'Callback':
                return 'Error in the OAuth callback handler route.';
            case 'OAuthAccountNotLinked':
                return 'Email on the account is already linked but not with this OAuth account.';
            case 'EmailSignin':
                return 'Check your email inbox for sign in link.';
            case 'CredentialsSignin':
                return 'Sign in failed. Check the details you provided are correct.';
            case 'SessionRequired':
                return 'Please sign in to access this page.';
            default:
                return 'An error occurred during authentication.';
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full p-8 bg-base-100 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-4">Authentication Error</h1>
        
        <div className="alert alert-error mb-6">
          <p>{getErrorMessage(error || '')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/auth/signin" className="btn btn-primary w-full">
            Try Again
          </Link>
          <Link href="/" className="btn btn-ghost w-full">
            Go Home
          </Link>
        </div>
      </div>
    </div>);
}
