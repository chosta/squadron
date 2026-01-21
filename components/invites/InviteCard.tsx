import type { SquadInviteWithDetails } from '@/types/squad';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { InviteActions } from './InviteActions';
import { ValidatorBadge } from '@/components/users/ValidatorBadge';

interface InviteCardProps {
  invite: SquadInviteWithDetails;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
  inviterIsValidator?: boolean;
}

export function InviteCard({ invite, onAccept, onDecline, inviterIsValidator = false }: InviteCardProps) {
  const expiresAt = new Date(invite.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {invite.squad.avatarUrl ? (
            <img
              src={invite.squad.avatarUrl}
              alt={invite.squad.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-2xl text-primary-600">
                {invite.squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {invite.squad.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            Invited by{' '}
            <span className="font-medium">
              {invite.inviter.ethosDisplayName || invite.inviter.ethosUsername || 'Unknown'}
            </span>
            {inviterIsValidator && <ValidatorBadge size="sm" />}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm text-gray-500">Role:</span>
            <SquadRoleBadge role={invite.role} size="sm" />
          </div>
          {invite.message && (
            <p className="mt-3 text-sm text-gray-600 italic">
              &ldquo;{invite.message}&rdquo;
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {daysUntilExpiry > 0
              ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
              : 'Expires today'}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <InviteActions
          inviteId={invite.id}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </div>
    </div>
  );
}
