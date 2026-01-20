import Link from 'next/link';
import { UserForm } from '@/components/UserForm';
import { Button } from '@/components/ui/Button';

export default function NewUserPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
        <p className="text-gray-500">Add a new user to the system</p>
      </div>

      <div className="max-w-2xl">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
