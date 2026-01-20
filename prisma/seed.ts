import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Note: With Privy authentication and Ethos profile integration,
 * users are created through the auth flow, not seeded directly.
 *
 * This seed file is kept for reference but doesn't create users.
 * Users must authenticate with Privy and have an Ethos profile to be created.
 */
async function main() {
  console.log('Database seeding...');
  console.log('');
  console.log('Note: Users are now created through Privy authentication.');
  console.log('To create a user:');
  console.log('1. Start the dev server: yarn dev');
  console.log('2. Visit http://localhost:3000');
  console.log('3. Click "Sign in with Ethos" and connect your wallet');
  console.log('4. Your user will be created with Ethos profile data');
  console.log('');
  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
