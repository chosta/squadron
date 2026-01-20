import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
        <h1 className="text-2xl font-bold text-gray-900">User Creation</h1>
        <p className="text-gray-500">How users are added to the system</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Users Join via Ethos Authentication
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Users are created automatically when they sign in with their Ethos profile.
              Direct user creation is not available - users must authenticate through the sign-in flow.
            </p>
            <div className="space-y-3 text-left max-w-sm mx-auto text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>User visits the app and clicks &quot;Sign in with Ethos&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>They connect their wallet via Privy</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>Their Ethos profile is fetched and a user account is created</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
