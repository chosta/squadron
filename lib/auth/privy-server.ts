import { PrivyClient } from '@privy-io/server-auth';

/**
 * Privy server-side client for token verification
 */
let privyClientInstance: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (!privyClientInstance) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('Missing Privy configuration: NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET');
    }

    privyClientInstance = new PrivyClient(appId, appSecret);
  }

  return privyClientInstance;
}

/**
 * Verify a Privy access token and return the user claims
 */
export async function verifyPrivyToken(accessToken: string): Promise<{
  userId: string;
  appId: string;
  issuedAt: number;
  expiration: number;
} | null> {
  try {
    const client = getPrivyClient();
    const verifiedClaims = await client.verifyAuthToken(accessToken);

    return {
      userId: verifiedClaims.userId,
      appId: verifiedClaims.appId,
      issuedAt: verifiedClaims.issuedAt,
      expiration: verifiedClaims.expiration,
    };
  } catch (error) {
    console.error('Failed to verify Privy token:', error);
    return null;
  }
}

/**
 * Get Privy user by their Privy ID (DID)
 */
export async function getPrivyUser(privyUserId: string) {
  try {
    const client = getPrivyClient();
    const user = await client.getUser(privyUserId);
    return user;
  } catch (error) {
    console.error('Failed to get Privy user:', error);
    return null;
  }
}

/**
 * Extract wallet address from Privy user
 */
export function extractWalletAddress(privyUser: Awaited<ReturnType<PrivyClient['getUser']>>): string | null {
  if (!privyUser) return null;

  // Check linked accounts for wallet
  const walletAccount = privyUser.linkedAccounts?.find(
    (account) => account.type === 'wallet'
  );

  if (walletAccount && 'address' in walletAccount) {
    return walletAccount.address;
  }

  return null;
}

export { getPrivyClient };
