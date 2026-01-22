/**
 * User Resolver for Scenario Seeding
 *
 * Resolves user names/handles to database User records.
 * Resolution order:
 * 1. Database lookup (by ethosUsername, ethosDisplayName, ethosXHandle)
 * 2. Ethos API lookup (by X handle)
 * 3. Returns null for interactive handling
 */

import { prisma } from '../../lib/prisma';
import { EthosClient } from '../../lib/services/ethos-client';
import type { EthosUser } from '../../types/ethos';
import type { SquadRole } from '../../types/squad';
import type { User } from '@prisma/client';

export interface ResolvedUser {
  user: User;
  source: 'database' | 'ethos_api';
  isNew: boolean;
}

export interface UnresolvedUser {
  name: string;
  reason: string;
}

export interface UserResolutionResult {
  resolved: ResolvedUser[];
  unresolved: UnresolvedUser[];
}

export interface ParsedMember {
  name: string;
  role?: SquadRole;
}

const ethosClient = EthosClient.getInstance();

/**
 * Parse a member string like "Clemente as DEV" or just "Clemente"
 */
export function parseMemberString(memberStr: string): ParsedMember {
  // Check for "name as ROLE" pattern
  const asMatch = memberStr.match(/^(.+?)\s+as\s+(\w+)$/i);
  if (asMatch) {
    const role = asMatch[2].toUpperCase() as SquadRole;
    return {
      name: asMatch[1].trim(),
      role: isValidRole(role) ? role : undefined,
    };
  }

  // Just a name
  return { name: memberStr.trim() };
}

/**
 * Check if a string is a valid SquadRole
 */
function isValidRole(role: string): role is SquadRole {
  const validRoles: SquadRole[] = [
    'DEGEN',
    'SUGAR_DADDY',
    'ALPHA_CALLER',
    'TRADER',
    'DEV',
    'VIBE_CODER',
    'KOL',
    'WHALE',
    'RESEARCHER',
    'COMMUNITY_BUILDER',
  ];
  return validRoles.includes(role as SquadRole);
}

/**
 * Normalize a name/handle for comparison
 * - Remove @ prefix
 * - Lowercase for case-insensitive matching
 */
function normalizeName(name: string): string {
  return name.replace(/^@/, '').toLowerCase().trim();
}

/**
 * Look up user in database by various fields
 */
async function findUserInDatabase(name: string): Promise<User | null> {
  const normalizedName = normalizeName(name);

  // Try exact matches first
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { ethosUsername: { equals: normalizedName, mode: 'insensitive' } },
        { ethosDisplayName: { equals: name.trim(), mode: 'insensitive' } },
        { ethosXHandle: { equals: normalizedName, mode: 'insensitive' } },
      ],
    },
  });

  if (user) return user;

  // Try partial matches on display name
  const partialMatch = await prisma.user.findFirst({
    where: {
      ethosDisplayName: {
        contains: name.trim(),
        mode: 'insensitive',
      },
    },
  });

  return partialMatch;
}

/**
 * Look up user via Ethos API by X handle
 */
async function findUserViaEthos(handle: string): Promise<EthosUser | null> {
  const normalizedHandle = normalizeName(handle);

  const response = await ethosClient.getUserByXHandle(normalizedHandle);
  if (response.ok && response.data) {
    return response.data;
  }

  return null;
}

/**
 * Create or update a user in the database from Ethos data
 */
async function upsertUserFromEthos(ethosUser: EthosUser): Promise<User> {
  const dbFields = EthosClient.toDbFields(ethosUser);

  // Generate a privy ID for seeded users
  const privyId = `seed:ethos:${ethosUser.profileId}`;
  const privyDid = `did:privy:seed:${ethosUser.profileId}`;

  // Check if user already exists by Ethos profile ID
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ ethosProfileId: ethosUser.profileId }, { privyId }],
    },
  });

  if (existingUser) {
    // Update existing user with latest Ethos data
    return prisma.user.update({
      where: { id: existingUser.id },
      data: dbFields,
    });
  }

  // Create new user
  return prisma.user.create({
    data: {
      privyId,
      privyDid,
      ...dbFields,
    } as Parameters<typeof prisma.user.create>[0]['data'],
  });
}

/**
 * Resolve a single user by name/handle
 */
export async function resolveUser(
  name: string
): Promise<ResolvedUser | UnresolvedUser> {
  // 1. Try database lookup
  const dbUser = await findUserInDatabase(name);
  if (dbUser) {
    return {
      user: dbUser,
      source: 'database',
      isNew: false,
    };
  }

  // 2. Try Ethos API lookup (if looks like a handle)
  const looksLikeHandle = name.startsWith('@') || !name.includes(' ');
  if (looksLikeHandle) {
    const ethosUser = await findUserViaEthos(name);
    if (ethosUser) {
      const user = await upsertUserFromEthos(ethosUser);
      return {
        user,
        source: 'ethos_api',
        isNew: true,
      };
    }
  }

  // 3. Return unresolved
  return {
    name,
    reason: `Could not find "${name}" in database or via Ethos API. Please provide an X handle (e.g., @${normalizeName(name)}).`,
  };
}

/**
 * Resolve multiple users
 */
export async function resolveUsers(
  names: string[]
): Promise<UserResolutionResult> {
  const resolved: ResolvedUser[] = [];
  const unresolved: UnresolvedUser[] = [];

  for (const name of names) {
    const result = await resolveUser(name);

    if ('user' in result) {
      resolved.push(result);
    } else {
      unresolved.push(result);
    }
  }

  return { resolved, unresolved };
}

/**
 * Resolve a user by specific lookup type
 */
export async function resolveUserByType(
  identifier: string,
  type: 'xHandle' | 'wallet' | 'profileId'
): Promise<ResolvedUser | UnresolvedUser> {
  switch (type) {
    case 'xHandle': {
      const handle = normalizeName(identifier);

      // Try DB first
      const dbUser = await prisma.user.findFirst({
        where: { ethosXHandle: { equals: handle, mode: 'insensitive' } },
      });

      if (dbUser) {
        return { user: dbUser, source: 'database', isNew: false };
      }

      // Try Ethos API
      const ethosUser = await findUserViaEthos(handle);
      if (ethosUser) {
        const user = await upsertUserFromEthos(ethosUser);
        return { user, source: 'ethos_api', isNew: true };
      }

      return {
        name: identifier,
        reason: `X handle "@${handle}" not found on Ethos Network`,
      };
    }

    case 'wallet': {
      const address = identifier.toLowerCase();

      // Try DB first
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { ethosPrimaryWallet: { equals: address, mode: 'insensitive' } },
            { ethosWallets: { has: address } },
          ],
        },
      });

      if (dbUser) {
        return { user: dbUser, source: 'database', isNew: false };
      }

      // Try Ethos API
      const response = await ethosClient.getUserByAddress(address);
      if (response.ok && response.data) {
        const user = await upsertUserFromEthos(response.data);
        return { user, source: 'ethos_api', isNew: true };
      }

      return {
        name: identifier,
        reason: `Wallet address "${address}" not found on Ethos Network`,
      };
    }

    case 'profileId': {
      const profileId = parseInt(identifier, 10);
      if (isNaN(profileId)) {
        return { name: identifier, reason: 'Invalid profile ID' };
      }

      // Try DB first
      const dbUser = await prisma.user.findFirst({
        where: { ethosProfileId: profileId },
      });

      if (dbUser) {
        return { user: dbUser, source: 'database', isNew: false };
      }

      // Try Ethos API
      const response = await ethosClient.getUserByProfileId(profileId);
      if (response.ok && response.data) {
        const user = await upsertUserFromEthos(response.data);
        return { user, source: 'ethos_api', isNew: true };
      }

      return {
        name: identifier,
        reason: `Profile ID "${profileId}" not found on Ethos Network`,
      };
    }
  }
}

/**
 * Check if a result is resolved
 */
export function isResolved(
  result: ResolvedUser | UnresolvedUser
): result is ResolvedUser {
  return 'user' in result;
}

/**
 * Result of batch adding users by handles
 */
export interface UserAddResult {
  added: { user: User; handle: string }[];
  existing: { user: User; handle: string }[];
  failed: { handle: string; reason: string }[];
}

/**
 * Batch add users by X handles
 *
 * Resolves multiple handles and creates users in the database.
 * Handles are normalized (@ prefix removed, lowercased).
 *
 * @param handles - Array of X handles (with or without @ prefix)
 * @param defaultRole - Optional role to assign to new users
 * @returns Summary of added, existing, and failed users
 */
export async function addUsersByHandles(
  handles: string[],
  defaultRole?: SquadRole
): Promise<UserAddResult> {
  const result: UserAddResult = {
    added: [],
    existing: [],
    failed: [],
  };

  for (const rawHandle of handles) {
    const handle = rawHandle.replace(/^@/, '').trim();

    if (!handle) {
      result.failed.push({ handle: rawHandle, reason: 'Empty handle' });
      continue;
    }

    try {
      const resolved = await resolveUserByType(handle, 'xHandle');

      if ('user' in resolved) {
        if (resolved.isNew) {
          // Update with role if provided
          if (defaultRole) {
            await prisma.user.update({
              where: { id: resolved.user.id },
              data: { primarySquadRole: defaultRole },
            });
            resolved.user.primarySquadRole = defaultRole;
          }
          result.added.push({ user: resolved.user, handle });
        } else {
          result.existing.push({ user: resolved.user, handle });
        }
      } else {
        result.failed.push({ handle, reason: resolved.reason });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.failed.push({ handle, reason: message });
    }
  }

  return result;
}
