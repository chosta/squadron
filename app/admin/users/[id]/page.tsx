import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UserForm } from '@/components/UserForm';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            &larr; Back to Users
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-500">Update user information</p>
      </div>

      <div className="max-w-2xl">
        <UserForm user={user} mode="edit" />
      </div>
    </div>
  );
}
