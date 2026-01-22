/**
 * Ethos Network API Fetcher for Seeding
 * Provides utilities to search and fetch user data from the Ethos Network API v2
 */

import type { EthosUser, EthosApiResponse } from '../../types/ethos';
import { EthosClient } from '../../lib/services/ethos-client';
import type { SquadRole } from '../../types/squad';

const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';
const ETHOS_CLIENT_ID = process.env.ETHOS_CLIENT_ID || 'squadron-seed@1.0.0';
const RATE_LIMIT_DELAY = 100; // ms between requests

// Track seen profile IDs to avoid duplicates
const seenProfileIds = new Set<number>();

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search users by query string with retry logic
 */
export async function searchUsers(
  query: string,
  limit: number = 20,
  retries: number = 3
): Promise<EthosUser[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(
        `${ETHOS_API_BASE}/users/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'X-Ethos-Client': ETHOS_CLIENT_ID,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 429) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited on search "${query}", waiting ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      if (response.status >= 500) {
        // Server error - retry
        const waitTime = Math.pow(2, attempt) * 500;
        console.log(`Server error on search "${query}", retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        console.error(`Search failed for "${query}": ${response.status}`);
        return [];
      }

      const data = await response.json();

      // API returns { values: EthosUser[] }
      const users = data.values || data.results || data.users || data || [];
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error(`Search error for "${query}":`, error);
      if (attempt < retries - 1) {
        await sleep(Math.pow(2, attempt) * 500);
      }
    }
  }

  return [];
}

/**
 * Get user by handle (username)
 */
export async function getUserByHandle(
  handle: string
): Promise<EthosUser | null> {
  try {
    const response = await fetch(
      `${ETHOS_API_BASE}/user/by/username/${encodeURIComponent(handle)}`,
      {
        headers: {
          'X-Ethos-Client': ETHOS_CLIENT_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching user "${handle}":`, error);
    return null;
  }
}

/**
 * Get user by profile ID
 */
export async function getUserByProfileId(
  profileId: number
): Promise<EthosUser | null> {
  try {
    const response = await fetch(
      `${ETHOS_API_BASE}/user/by/profileId/${profileId}`,
      {
        headers: {
          'X-Ethos-Client': ETHOS_CLIENT_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching profile ${profileId}:`, error);
    return null;
  }
}

/**
 * Role-specific search queries
 */
export const ROLE_SEARCH_CONFIG: Record<SquadRole, {
  queries: string[];
  scoreMin?: number;
  filter?: (user: EthosUser) => boolean;
}> = {
  ALPHA_CALLER: {
    queries: ['alpha', 'caller', 'signal', 'alerts'],
    scoreMin: 1200,
  },
  TRADER: {
    queries: ['trader', 'trading', 'dex', 'perps'],
    scoreMin: 1100,
  },
  DEV: {
    queries: ['dev', 'builder', 'engineer', 'developer', 'solidity'],
    filter: (user) => {
      // Prefer users with Discord or Farcaster (common for devs)
      const socialAccounts = EthosClient.parseUserkeys(user.userkeys);
      return !!(socialAccounts.discordId || socialAccounts.farcasterId);
    },
  },
  KOL: {
    queries: ['kol', 'influencer', 'creator', 'content', 'thought leader'],
    filter: (user) => user.influenceFactor > 10 || user.score >= 1400,
  },
  DEGEN: {
    queries: ['degen', 'ape', 'gambler', 'yolo', 'degen'],
  },
  SUGAR_DADDY: {
    queries: ['whale', 'backer', 'investor', 'patron'],
    filter: (user) => {
      // Look for users who have given vouches
      return user.stats?.vouch?.given?.count > 0;
    },
  },
  VIBE_CODER: {
    queries: ['vibe', 'creative', 'design', 'artist', 'aesthetic'],
  },
  WHALE: {
    queries: ['whale', 'og', 'early', 'hodl', 'holder'],
    filter: (user) => {
      // Look for users with high scores (indicates established presence)
      // or any vouch activity (indicates financial activity)
      const hasVouchActivity = (user.stats?.vouch?.given?.count || 0) > 0 ||
        (user.stats?.vouch?.received?.count || 0) > 0;
      return user.score >= 1300 || hasVouchActivity;
    },
  },
  RESEARCHER: {
    queries: ['research', 'analyst', 'data', 'onchain'],
    filter: (user) => {
      // High reviews received suggests active researcher
      const totalReviews = (user.stats?.review?.received?.positive || 0) +
        (user.stats?.review?.received?.neutral || 0);
      return totalReviews > 5;
    },
  },
  COMMUNITY_BUILDER: {
    queries: ['community', 'builder', 'dao', 'coordinator', 'ambassador'],
    filter: (user) => {
      // Multiple social accounts suggests community builder
      const socials = EthosClient.parseUserkeys(user.userkeys);
      let socialCount = 0;
      if (socials.xHandle) socialCount++;
      if (socials.discordId) socialCount++;
      if (socials.farcasterId) socialCount++;
      if (socials.telegramId) socialCount++;
      return socialCount >= 2;
    },
  },
};

/**
 * Fetch users for a specific role
 * @param role - The squad role to search for
 * @param count - Number of users to fetch (default: 10)
 * @param excludeProfileIds - Optional set of profile IDs to exclude (for avoiding duplicates)
 */
export async function fetchUsersForRole(
  role: SquadRole,
  count: number = 10,
  excludeProfileIds?: Set<number>
): Promise<EthosUser[]> {
  const config = ROLE_SEARCH_CONFIG[role];
  const results: EthosUser[] = [];

  console.log(`\nFetching users for role: ${role}`);

  for (const query of config.queries) {
    if (results.length >= count) break;

    await sleep(RATE_LIMIT_DELAY);

    const users = await searchUsers(query, 50);
    console.log(`  Search "${query}": found ${users.length} users`);

    for (const user of users) {
      if (results.length >= count) break;

      // Skip if already seen in this session
      if (seenProfileIds.has(user.profileId)) {
        continue;
      }

      // Skip if in the exclude list (e.g., already in database)
      if (excludeProfileIds?.has(user.profileId)) {
        continue;
      }

      // Apply score filter
      if (config.scoreMin && user.score < config.scoreMin) {
        continue;
      }

      // Apply custom filter
      if (config.filter && !config.filter(user)) {
        continue;
      }

      seenProfileIds.add(user.profileId);
      results.push(user);
      console.log(`  + Added: ${user.username || user.displayName} (score: ${user.score})`);
    }
  }

  console.log(`  Total for ${role}: ${results.length} users`);
  return results;
}

/**
 * Transform Ethos user to database create input
 */
export function transformToDbInput(ethosUser: EthosUser): Record<string, unknown> {
  const socialAccounts = EthosClient.parseUserkeys(ethosUser.userkeys);

  return {
    // Generate a unique privy ID for seeded users
    privyId: `seed:ethos:${ethosUser.profileId}`,
    privyDid: `did:privy:seed:${ethosUser.profileId}`,

    // Ethos fields
    ethosProfileId: ethosUser.profileId,
    ethosUserId: ethosUser.id,
    ethosUsername: ethosUser.username,
    ethosDisplayName: ethosUser.displayName,
    ethosAvatarUrl: ethosUser.avatarUrl,
    ethosDescription: ethosUser.description,
    ethosScore: ethosUser.score,
    ethosStatus: ethosUser.status,
    ethosXHandle: socialAccounts.xHandle || null,
    ethosXId: socialAccounts.xId || null,
    ethosDiscordId: socialAccounts.discordId || null,
    ethosFarcasterId: socialAccounts.farcasterId || null,
    ethosTelegramId: socialAccounts.telegramId || null,
    ethosPrimaryWallet: socialAccounts.wallets[0] || null,
    ethosWallets: socialAccounts.wallets,
    ethosXpTotal: ethosUser.xpTotal,
    ethosXpStreakDays: ethosUser.xpStreakDays,
    ethosInfluenceFactor: ethosUser.influenceFactor,
    ethosInfluencePercentile: ethosUser.influenceFactorPercentile,
    ethosUserkeys: ethosUser.userkeys,
    ethosRawData: ethosUser,
    ethosLastSyncedAt: new Date(),
  };
}

/**
 * Reset seen profiles (for fresh runs)
 */
export function resetSeenProfiles(): void {
  seenProfileIds.clear();
}
