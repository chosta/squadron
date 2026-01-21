'use client';

import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES } from '@/types/squad';

interface SquadRoleSelectorProps {
  value: SquadRole;
  onChange: (role: SquadRole) => void;
  disabled?: boolean;
}

const roles = Object.entries(SQUAD_ROLES) as [SquadRole, typeof SQUAD_ROLES[SquadRole]][];

export function SquadRoleSelector({ value, onChange, disabled }: SquadRoleSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SquadRole)}
      disabled={disabled}
      className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {roles.map(([roleKey, roleConfig]) => (
        <option key={roleKey} value={roleKey}>
          {roleConfig.emoji} {roleConfig.label}
        </option>
      ))}
    </select>
  );
}
