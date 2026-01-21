/**
 * Seed script for chat demo data
 * Run with: yarn db:seed-chat
 *
 * Creates sample users, a squad, and chat messages for testing the chat UI.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Find chosta_eth user
  const mainUser = await prisma.user.findFirst({
    where: { ethosUsername: 'chosta_eth' }
  });

  if (!mainUser) {
    throw new Error('User chosta_eth not found. Please login first.');
  }

  console.log(`Found main user: ${mainUser.ethosUsername} (${mainUser.id})`);

  // 2. Create sample users (with fake Privy IDs)
  const sampleUsers = await Promise.all([
    prisma.user.upsert({
      where: { privyId: 'sample-user-alice' },
      update: {},
      create: {
        privyId: 'sample-user-alice',
        ethosUsername: 'alice_demo',
        ethosDisplayName: 'Alice',
        ethosAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        ethosScore: 1650,
      }
    }),
    prisma.user.upsert({
      where: { privyId: 'sample-user-bob' },
      update: {},
      create: {
        privyId: 'sample-user-bob',
        ethosUsername: 'bob_demo',
        ethosDisplayName: 'Bob',
        ethosAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        ethosScore: 1420,
      }
    }),
  ]);

  console.log(`Created/found ${sampleUsers.length} sample users`);

  // 3. Create squad with chosta_eth as captain
  const squad = await prisma.squad.create({
    data: {
      name: 'Chat Demo Squad',
      description: 'A demo squad for testing the chat feature',
      creatorId: mainUser.id,
      captainId: mainUser.id,
      maxSize: 5,
      isActive: true, // Will have 3 members
      members: {
        create: [
          { userId: mainUser.id, role: 'ALPHA_CALLER' },
          { userId: sampleUsers[0].id, role: 'TRADER' },
          { userId: sampleUsers[1].id, role: 'DEV' },
        ]
      }
    }
  });

  console.log(`Created squad: ${squad.name}`);

  // 4. Create sample chat messages (conversation flow)
  const messages = [
    { senderId: mainUser.id, content: 'Hey team! Welcome to our new squad chat.' },
    { senderId: sampleUsers[0].id, content: 'Thanks for the invite! Excited to be here.' },
    { senderId: sampleUsers[1].id, content: 'Yo! This chat feature is pretty slick.' },
    { senderId: mainUser.id, content: 'Right? We can coordinate our moves here now.' },
    { senderId: sampleUsers[0].id, content: 'I saw some alpha on ETH - looks like a good entry point soon.' },
    { senderId: sampleUsers[1].id, content: "Interesting... what's your timeframe?" },
    { senderId: sampleUsers[0].id, content: 'Looking at the 4h chart, probably next 24-48 hours.' },
    { senderId: mainUser.id, content: "Keep us posted. I'll set up some alerts." },
    { senderId: sampleUsers[1].id, content: 'I can write a quick bot to track it if you want.' },
    { senderId: mainUser.id, content: 'That would be awesome!' },
  ];

  // Create messages with staggered timestamps (1 min apart, backdated)
  const baseTime = new Date();
  for (let i = 0; i < messages.length; i++) {
    await prisma.chatMessage.create({
      data: {
        squadId: squad.id,
        senderId: messages[i].senderId,
        content: messages[i].content,
        createdAt: new Date(baseTime.getTime() - (messages.length - i) * 60000),
      }
    });
  }

  console.log('');
  console.log('Chat demo data created!');
  console.log(`   Squad: ${squad.name} (${squad.id})`);
  console.log(`   Members: 3 (chosta_eth + 2 sample users)`);
  console.log(`   Messages: ${messages.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
