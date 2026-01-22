/**
 * Category Seeder
 *
 * Seeds users by role/category. Fetches users from Ethos API matching
 * the role criteria and creates them in the database with the appropriate
 * primarySquadRole set.
 */

import { prisma } from '../../lib/prisma';
import { fetchUsersForRole, transformToDbInput } from '../../prisma/seeds/ethos-fetcher';
import type { SquadRole } from '../../types/squad';
import type { User } from '@prisma/client';

/**
 * Role aliases for natural language parsing
 */
export const ROLE_ALIASES: Record<string, SquadRole> = {
  degen: 'DEGEN',
  degens: 'DEGEN',
  whale: 'WHALE',
  whales: 'WHALE',
  dev: 'DEV',
  devs: 'DEV',
  developer: 'DEV',
  developers: 'DEV',
  trader: 'TRADER',
  traders: 'TRADER',
  kol: 'KOL',
  kols: 'KOL',
  researcher: 'RESEARCHER',
  researchers: 'RESEARCHER',
  alpha: 'ALPHA_CALLER',
  alphas: 'ALPHA_CALLER',
  alpha_caller: 'ALPHA_CALLER',
  alpha_callers: 'ALPHA_CALLER',
  vibe: 'VIBE_CODER',
  vibes: 'VIBE_CODER',
  vibe_coder: 'VIBE_CODER',
  vibe_coders: 'VIBE_CODER',
  community: 'COMMUNITY_BUILDER',
  community_builder: 'COMMUNITY_BUILDER',
  community_builders: 'COMMUNITY_BUILDER',
  sugar: 'SUGAR_DADDY',
  sugardaddy: 'SUGAR_DADDY',
  sugar_daddy: 'SUGAR_DADDY',
  sugar_daddies: 'SUGAR_DADDY',
};

/**
 * Parse a role string (case-insensitive, handles aliases)
 */
export function parseRole(roleStr: string): SquadRole | null {
  const normalized = roleStr.toLowerCase().trim();

  // Check aliases
  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized];
  }

  // Check direct match (uppercase)
  const upper = normalized.toUpperCase();
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

  if (validRoles.includes(upper as SquadRole)) {
    return upper as SquadRole;
  }

  return null;
}

export interface CategorySeedResult {
  role: SquadRole;
  added: User[];
  skipped: number; // Already in DB
  errors: string[];
}

/**
 * Shuffle an array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Seed users for a specific role/category
 *
 * Fetches users from Ethos API matching the role criteria,
 * excludes those already in the database, and creates new users
 * with the primarySquadRole set.
 *
 * @param role - The squad role to seed
 * @param count - Number of users to add
 * @returns Summary of the seeding operation
 */
export async function seedUsersForCategory(
  role: SquadRole,
  count: number
): Promise<CategorySeedResult> {
  const result: CategorySeedResult = {
    role,
    added: [],
    skipped: 0,
    errors: [],
  };

  // 1. Get existing seeded users with this role
  const existingUsers = await prisma.user.findMany({
    where: {
      privyId: { startsWith: 'seed:' },
      primarySquadRole: role,
    },
    select: { ethosProfileId: true },
  });

  // Create set of existing profile IDs to exclude
  const excludeProfileIds = new Set<number>(
    existingUsers.map((u) => u.ethosProfileId).filter((id): id is number => id !== null)
  );

  console.log(`Found ${excludeProfileIds.size} existing ${role} users to exclude`);

  // 2. Fetch users from Ethos API, excluding existing ones
  // Request extra users to account for potential filtering
  const ethosUsers = await fetchUsersForRole(role, count * 2, excludeProfileIds);

  if (ethosUsers.length === 0) {
    result.errors.push(`No users found for role ${role}`);
    return result;
  }

  // 3. Shuffle for randomness
  const shuffled = shuffleArray(ethosUsers);

  // 4. Create users in database
  for (const ethosUser of shuffled.slice(0, count)) {
    try {
      // Check if user already exists (by profileId or privyId)
      const privyId = `seed:ethos:${ethosUser.profileId}`;
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ ethosProfileId: ethosUser.profileId }, { privyId }],
        },
      });

      if (existing) {
        result.skipped++;
        continue;
      }

      // Transform and create user
      const dbInput = transformToDbInput(ethosUser);
      const user = await prisma.user.create({
        data: {
          ...dbInput,
          primarySquadRole: role,
        } as Parameters<typeof prisma.user.create>[0]['data'],
      });

      result.added.push(user);
      console.log(
        `Created ${role}: ${ethosUser.displayName || ethosUser.username} (@${ethosUser.username})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`Failed to create user ${ethosUser.username}: ${message}`);
    }
  }

  return result;
}

/**
 * Get count of seeded users by role
 */
export async function getSeededUserCountByRole(): Promise<Record<SquadRole, number>> {
  const roles: SquadRole[] = [
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

  const counts: Record<string, number> = {};

  for (const role of roles) {
    const count = await prisma.user.count({
      where: {
        privyId: { startsWith: 'seed:' },
        primarySquadRole: role,
      },
    });
    counts[role] = count;
  }

  return counts as Record<SquadRole, number>;
}
