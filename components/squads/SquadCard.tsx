import Link from 'next/link';
import type { SquadWithMembers } from '@/types/squad';
import { ValidatorBadge } from '@/components/users/ValidatorBadge';

interface SquadCardProps {
  squad: SquadWithMembers;
  showManage?: boolean;
  captainIsValidator?: boolean;
}

export function SquadCard({ squad, showManage = false, captainIsValidator = false }: SquadCardProps) {
  const memberCount = squad._count?.members ?? squad.members.length;

  return (
    <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Avatar Section - 4:3 aspect ratio */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        {squad.avatarUrl ? (
          <img
            src={squad.avatarUrl}
            alt={squad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-6xl font-semibold text-primary-400">
              {squad.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-hull-100 truncate">
            {squad.name}
          </h3>
          {squad.isActive ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-space-700 text-hull-400">
              Inactive
            </span>
          )}
        </div>
        {squad.description && (
          <p className="mt-2 text-sm text-hull-400 line-clamp-2">
            {squad.description}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-1 text-sm text-hull-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {memberCount}/{squad.maxSize} members
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Captain: {squad.captain.ethosDisplayName || squad.captain.ethosUsername || 'Unknown'}
            {captainIsValidator && <ValidatorBadge size="sm" />}
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/squads/${squad.id}`}
            className="flex-1 text-center px-4 py-2 text-sm font-medium text-hull-300 bg-space-700 rounded-lg hover:bg-space-600 transition-colors"
          >
            View
          </Link>
          {showManage && (
            <Link
              href={`/dashboard/squads/${squad.id}`}
              className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
