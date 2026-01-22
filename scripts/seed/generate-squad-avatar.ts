import { GeminiClient } from '../../lib/services/gemini-client';
import { prisma } from '../../lib/prisma';

async function generateAvatar() {
  const squadId = process.argv[2];

  if (!squadId) {
    console.log('Usage: npx tsx scripts/seed/generate-squad-avatar.ts <squadId>');
    process.exit(1);
  }

  // Get squad details
  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    select: { name: true, description: true }
  });

  if (!squad) {
    console.log('Squad not found:', squadId);
    process.exit(1);
  }

  console.log('Generating avatar for:', squad.name);
  console.log('Description:', squad.description);
  console.log('');

  if (!GeminiClient.isConfigured()) {
    console.log('ERROR: GEMINI_API_KEY not configured');
    process.exit(1);
  }

  const client = GeminiClient.getInstance();
  const imageDataUrl = await client.generateSquadImage(squad.name, squad.description || undefined);

  // Update the squad with the new avatar
  await prisma.squad.update({
    where: { id: squadId },
    data: {
      avatarUrl: imageDataUrl,
      avatarRegenerationCount: { increment: 1 }
    }
  });

  console.log('Avatar generated and saved!');
  console.log('Image size:', Math.round(imageDataUrl.length / 1024), 'KB');

  await prisma.$disconnect();
}

generateAvatar().catch(console.error);
