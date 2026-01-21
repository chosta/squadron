'use client';

import Link from 'next/link';
import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES } from '@/types/squad';

interface RoleFilterProps {
  selectedRole: SquadRole | null;
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

export function RoleFilter({ selectedRole }: RoleFilterProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/users"
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedRole === null
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
              href={`/users?role=${role}`}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
