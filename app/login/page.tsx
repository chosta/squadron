'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { SignInButton } from '@/components/auth/SignInButton';
import { NoEthosProfile } from '@/components/auth/NoEthosProfile';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, requiresEthosProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !requiresEthosProfile) {
      router.push('/');
    }
  }, [isAuthenticated, requiresEthosProfile, router]);

  // Show NoEthosProfile if needed
  if (requiresEthosProfile) {
    return <NoEthosProfile />;
  }

  // Already authenticated - show loading while redirect happens
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Squadron</h1>
            <p className="text-gray-600 mt-2">
              Sign in with your wallet to continue
            </p>
          </div>

          {/* Sign In Button */}
          <SignInButton className="w-full" />

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Why Ethos?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Verified credibility score</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Portable reputation across apps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Trust built through vouches and reviews</span>
              </li>
            </ul>
          </div>

          {/* Create Profile Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an Ethos profile?{' '}
              <a
                href="https://ethos.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create one now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
