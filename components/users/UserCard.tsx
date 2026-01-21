import Link from 'next/link';
import type { User } from '@/types';

interface UserCardProps {
  user: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl' | 'ethosScore'>;
}

export function UserCard({ user }: UserCardProps) {
  const displayName = user.ethosDisplayName || user.ethosUsername || 'Unknown';

  return (
    <Link
      href={`/users/${user.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col items-center text-center">
        {user.ethosAvatarUrl ? (
          <img
            src={user.ethosAvatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-600 font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold text-gray-900 truncate max-w-full">
          {displayName}
        </h3>
        {user.ethosScore !== null && (
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Ethos Score: {user.ethosScore}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
