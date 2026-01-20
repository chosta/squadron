import { cookies } from 'next/headers';
import { verifyPrivyToken } from './privy-server';
import { prisma } from '@/lib/prisma';
import type { SessionData } from '@/types/auth';

const SESSION_COOKIE_NAME = 'squadron_session';

/**
 * Get the current session from cookies and verify it
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('privy-token')?.value;

  if (!accessToken) {
    return null;
  }

  const claims = await verifyPrivyToken(accessToken);
  if (!claims) {
    return null;
  }

  // Find user by Privy ID
  const user = await prisma.user.findUnique({
    where: { privyId: claims.userId },
    select: {
      id: true,
      privyId: true,
      ethosProfileId: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    privyId: user.privyId,
    ethosProfileId: user.ethosProfileId,
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}

/**
 * Check if the request has a valid authenticated session
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Get user ID from session (for API routes)
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
