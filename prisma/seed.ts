import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia', 'Elijah',
  'Isabella', 'Lucas', 'Mia', 'Mason', 'Charlotte', 'Ethan', 'Amelia',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
];

const roles: UserRole[] = ['USER', 'USER', 'USER', 'USER', 'MODERATOR', 'ADMIN'];
const statuses: UserStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED'];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('Seeding database...');

  // Clear existing users
  await prisma.user.deleteMany();

  // Create 15 sample users
  const users = [];

  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[i];
    const lastName = randomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    users.push({
      email,
      firstName,
      lastName,
      role: randomElement(roles),
      status: randomElement(statuses),
    });
  }

  // Ensure at least one admin and one moderator
  users[0].role = 'ADMIN';
  users[0].status = 'ACTIVE';
  users[1].role = 'MODERATOR';
  users[1].status = 'ACTIVE';

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log(`Created ${users.length} users`);
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
