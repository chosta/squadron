'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { UserWithEthos, AuthMethod, AuthSyncRequest } from '@/types/auth';

interface SyncUserParams {
  authMethod: AuthMethod;
  walletAddress?: string;
  xHandle?: string;
}

interface AuthContextType {
  user: UserWithEthos | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  requiresEthosProfile: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshEthosData: () => Promise<void>;
  syncUser: (params: SyncUserParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Inner auth provider that uses Privy hooks
 */
function AuthProviderInner({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [user, setUser] = useState<UserWithEthos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresEthosProfile, setRequiresEthosProfile] = useState(false);

  /**
   * Sync user with backend after Privy auth
   */
  const syncUser = useCallback(async (params: SyncUserParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setRequiresEthosProfile(false);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const requestBody: AuthSyncRequest = {
        authMethod: params.authMethod,
        walletAddress: params.walletAddress,
        xHandle: params.xHandle,
      };

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'ETHOS_PROFILE_REQUIRED') {
          setRequiresEthosProfile(true);
          setUser(null);
          return;
        }
        throw new Error(data.message || 'Auth sync failed');
      }

      setUser(data.user);
    } catch (err) {
      console.error('Auth sync error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  /**
   * Check session on mount and when auth state changes
   */
  useEffect(() => {
    async function checkSession() {
      if (!ready) return;

      if (!authenticated || !privyUser) {
        setUser(null);
        setIsLoading(false);
        setRequiresEthosProfile(false);
        return;
      }

      // Detect auth method from Privy linked accounts
      const twitterAccount = privyUser.linkedAccounts?.find(
        (account) => account.type === 'twitter_oauth'
      );
      const wallet = wallets[0];

      // Sync based on auth method - prefer wallet if both are available
      if (wallet?.address) {
        await syncUser({ authMethod: 'wallet', walletAddress: wallet.address });
      } else if (twitterAccount && 'username' in twitterAccount && twitterAccount.username) {
        await syncUser({ authMethod: 'twitter', xHandle: twitterAccount.username });
      } else {
        // No valid auth method found
        setIsLoading(false);
      }
    }

    checkSession();
  }, [ready, authenticated, privyUser, wallets, syncUser]);

  /**
   * Login handler
   */
  const login = useCallback(() => {
    // Don't call privyLogin if already authenticated
    if (authenticated) {
      return;
    }
    setError(null);
    setRequiresEthosProfile(false);
    privyLogin();
  }, [privyLogin, authenticated]);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const accessToken = await getAccessToken();

      // Call backend logout
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      // Privy logout
      await privyLogout();

      setUser(null);
      setRequiresEthosProfile(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [privyLogout, getAccessToken]);

  /**
   * Manually refresh Ethos data
   */
  const refreshEthosData = useCallback(async () => {
    if (!authenticated || !user) return;

    try {
      setIsLoading(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/users/me/sync-ethos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh Ethos data');
      }

      setUser(data.user);
    } catch (err) {
      console.error('Ethos refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh Ethos data');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, user, getAccessToken]);

  const value: AuthContextType = {
    user,
    isLoading: !ready || isLoading,
    isAuthenticated: authenticated && !!user,
    error,
    requiresEthosProfile,
    login,
    logout,
    refreshEthosData,
    syncUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Placeholder context when Privy is not configured
 */
function UnconfiguredAuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: 'Privy not configured',
    requiresEthosProfile: false,
    login: () => console.warn('Privy not configured'),
    logout: async () => console.warn('Privy not configured'),
    refreshEthosData: async () => console.warn('Privy not configured'),
    syncUser: async (_params: SyncUserParams) => console.warn('Privy not configured'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Main AuthProvider with Privy wrapper
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Wait for client-side mount - Privy can't initialize during SSR/static generation
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mount, render unconfigured provider
  if (!mounted) {
    return <UnconfiguredAuthProvider>{children}</UnconfiguredAuthProvider>;
  }

  // If no app ID or placeholder value, render without Privy
  if (!appId || appId === 'your_privy_app_id') {
    console.warn('Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable authentication.');
    return <UnconfiguredAuthProvider>{children}</UnconfiguredAuthProvider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'twitter'],
        appearance: {
          theme: 'light',
          showWalletLoginFirst: true,
          logo: undefined,
        },
      }}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </PrivyProvider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
