import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES } from '@/types/squad';

interface SquadRoleBadgeProps {
  role: SquadRole;
  size?: 'sm' | 'md';
}

export function SquadRoleBadge({ role, size = 'md' }: SquadRoleBadgeProps) {
  const config = SQUAD_ROLES[role];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 bg-gray-100 text-gray-800 rounded-full font-medium ${sizeClasses}`}
      title={config.description}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
