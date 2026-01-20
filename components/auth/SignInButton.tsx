'use client';

import { useAuth } from './AuthProvider';

interface SignInButtonProps {
  className?: string;
}

/**
 * Sign in with Ethos button
 * Works for both new users (creates account) and returning users (signs in)
 */
export function SignInButton({ className = '' }: SignInButtonProps) {
  const { login, isLoading } = useAuth();

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-3
        bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
        text-white font-medium rounded-lg
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <EthosIcon />
          <span>Sign in with Ethos</span>
        </>
      )}
    </button>
  );
}

function EthosIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
