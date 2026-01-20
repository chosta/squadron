'use client';

import { useAuth } from './AuthProvider';

/**
 * Displayed when user authenticates but has no Ethos profile
 */
export function NoEthosProfile() {
  const { logout, syncUser, isLoading } = useAuth();
  const { wallets } = require('@privy-io/react-auth').useWallets();

  const handleTryAgain = async () => {
    const wallet = wallets[0];
    if (wallet?.address) {
      await syncUser(wallet.address);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Ethos Profile Required
        </h1>

        <p className="text-gray-600 mb-6">
          To use this app, you need an Ethos profile linked to your wallet.
          Ethos profiles help establish trust and credibility in the community.
        </p>

        <div className="space-y-4">
          <a
            href="https://ethos.network"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Ethos Profile
          </a>

          <button
            onClick={handleTryAgain}
            disabled={isLoading}
            className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Checking...' : 'Try Again'}
          </button>

          <button
            onClick={logout}
            disabled={isLoading}
            className="block w-full px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Already have an Ethos profile? Make sure it&apos;s linked to the wallet
          you connected.
        </p>
      </div>
    </div>
  );
}
