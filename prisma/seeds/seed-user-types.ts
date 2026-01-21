/**
 * Seed User Types from Ethos Network
 *
 * This script fetches real user data from the Ethos Network API
 * and creates 10 users per role type in the Squadron database.
 *
 * Total: 10 roles x 10 users = 100 seeded users
 *
 * Usage: yarn db:seed-users
 */

import { PrismaClient, SquadRole } from '@prisma/client';
import {
  fetchUsersForRole,
  transformToDbInput,
  resetSeenProfiles,
  ROLE_SEARCH_CONFIG,
} from './ethos-fetcher';

const prisma = new PrismaClient();

const USERS_PER_ROLE = 10;

// All roles to seed
const ALL_ROLES: SquadRole[] = [
  'ALPHA_CALLER',
  'TRADER',
  'DEV',
  'KOL',
  'DEGEN',
  'SUGAR_DADDY',
  'VIBE_CODER',
  'WHALE',
  'RESEARCHER',
  'COMMUNITY_BUILDER',
];

interface SeedStats {
  role: SquadRole;
  attempted: number;
  created: number;
  skipped: number;
  errors: number;
}

async function seedUsersForRole(role: SquadRole): Promise<SeedStats> {
  const stats: SeedStats = {
    role,
    attempted: 0,
    created: 0,
    skipped: 0,
    errors: 0,
  };

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Seeding ${role} users...`);
  console.log(`${'='.repeat(50)}`);

  const ethosUsers = await fetchUsersForRole(role, USERS_PER_ROLE);
  stats.attempted = ethosUsers.length;

  for (const ethosUser of ethosUsers) {
    try {
      // Check if user already exists by profileId
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { ethosProfileId: ethosUser.profileId },
            { privyId: `seed:ethos:${ethosUser.profileId}` },
          ],
        },
      });

      if (existing) {
        console.log(`  ~ Skipped: ${ethosUser.username || ethosUser.displayName} (already exists)`);
        stats.skipped++;
        continue;
      }

      // Transform and create user
      const userData = transformToDbInput(ethosUser);
      await prisma.user.create({
        data: {
          ...userData as any,
          primarySquadRole: role,  // Set the role they were seeded as
        },
      });

      console.log(`  + Created: ${ethosUser.username || ethosUser.displayName} (score: ${ethosUser.score})`);
      stats.created++;
    } catch (error) {
      console.error(`  ! Error creating ${ethosUser.username}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       Squadron User Seeding from Ethos Network           ║');
  console.log('║                                                          ║');
  console.log(`║       Target: ${USERS_PER_ROLE} users x ${ALL_ROLES.length} roles = ${USERS_PER_ROLE * ALL_ROLES.length} total         ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Reset tracking for fresh run
  resetSeenProfiles();

  const allStats: SeedStats[] = [];

  // Process roles sequentially to respect rate limits
  for (const role of ALL_ROLES) {
    const stats = await seedUsersForRole(role);
    allStats.push(stats);
  }

  // Summary
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                      SUMMARY                             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  console.log('Role               | Created | Skipped | Errors');
  console.log('-------------------|---------|---------|---------');

  for (const stats of allStats) {
    totalCreated += stats.created;
    totalSkipped += stats.skipped;
    totalErrors += stats.errors;

    console.log(
      `${stats.role.padEnd(18)} | ${String(stats.created).padStart(7)} | ${String(stats.skipped).padStart(7)} | ${String(stats.errors).padStart(7)}`
    );
  }

  console.log('-------------------|---------|---------|---------');
  console.log(
    `${'TOTAL'.padEnd(18)} | ${String(totalCreated).padStart(7)} | ${String(totalSkipped).padStart(7)} | ${String(totalErrors).padStart(7)}`
  );

  console.log('\n');

  // Final count
  const userCount = await prisma.user.count();
  console.log(`Total users in database: ${userCount}`);

  // Count seeded users
  const seededCount = await prisma.user.count({
    where: {
      privyId: {
        startsWith: 'seed:ethos:',
      },
    },
  });
  console.log(`Seeded users: ${seededCount}`);
  console.log('\n');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
