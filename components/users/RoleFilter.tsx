'use client';

import Link from 'next/link';
import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES } from '@/types/squad';

interface RoleFilterProps {
  selectedRole: SquadRole | null;
  searchQuery?: string;
}

const ALL_ROLES: SquadRole[] = [
  'DEGEN',
  'SUGAR_DADDY',
  'ALPHA_CALLER',
  'TRADER',
  'DEV',
  'VIBE_CODER',
  'KOL',
  'WHALE',
  'RESEARCHER',
  'COMMUNITY_BUILDER',
];

export function RoleFilter({ selectedRole, searchQuery }: RoleFilterProps) {
  const buildUrl = (role: SquadRole | null) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (searchQuery) params.set('search', searchQuery);
    const queryString = params.toString();
    return queryString ? `/users?${queryString}` : '/users';
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl(null)}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedRole === null
              ? 'bg-primary-500 text-white'
              : 'bg-space-800 text-hull-300 border border-space-600 hover:bg-space-700'
          }`}
        >
          All
        </Link>
        {ALL_ROLES.map((role) => {
          const config = SQUAD_ROLES[role];
          const isSelected = selectedRole === role;
          return (
            <Link
              key={role}
              href={buildUrl(role)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-space-800 text-hull-300 border border-space-600 hover:bg-space-700'
              }`}
              title={config.description}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
