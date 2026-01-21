import type { User } from './index';

// Enums matching Prisma schema
export type SquadRole =
  | 'DEGEN'
  | 'SUGAR_DADDY'
  | 'ALPHA_CALLER'
  | 'TRADER'
  | 'DEV'
  | 'VIBE_CODER'
  | 'KOL';

export type InviteStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED';

// Base interfaces
export interface Squad {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  minSize: number;
  maxSize: number;
  isFixedSize: boolean;
  isActive: boolean;
  creatorId: string;
  captainId: string;
}

export interface SquadMember {
  id: string;
  joinedAt: string;
  squadId: string;
  userId: string;
  role: SquadRole;
}

export interface SquadInvite {
  id: string;
  createdAt: string;
  updatedAt: string;
  squadId: string;
  inviterId: string;
  inviteeId: string;
  role: SquadRole;
  status: InviteStatus;
  message: string | null;
  expiresAt: string;
  respondedAt: string | null;
}

// Extended types with relations
export interface SquadMemberWithUser extends SquadMember {
  user: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl' | 'ethosScore'>;
}

export interface SquadWithMembers extends Squad {
  members: SquadMemberWithUser[];
  creator: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl'>;
  captain: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl'>;
  _count?: {
    members: number;
  };
}

export interface SquadInviteWithDetails extends SquadInvite {
  squad: Pick<Squad, 'id' | 'name' | 'avatarUrl'>;
  inviter: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl'>;
  invitee: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl'>;
}

// Input types
export interface CreateSquadInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  maxSize?: number;
  isFixedSize?: boolean;
  role?: SquadRole;  // Creator's role when joining
}

export interface UpdateSquadInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  maxSize?: number;
  isFixedSize?: boolean;
}

export interface CreateInviteInput {
  inviteeId: string;
  role: SquadRole;
  message?: string;
}

// Response types
export interface SquadCreationEligibility {
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number;
  ethosScore: number | null;
  isValidator: boolean;
}

export interface AcceptInviteResult {
  invite: SquadInvite;
  member: SquadMember;
  squad: Squad;
}

// Squad role configuration
export interface SquadRoleConfig {
  label: string;
  emoji: string;
  description: string;
}

export const SQUAD_ROLES: Record<SquadRole, SquadRoleConfig> = {
  DEGEN: {
    label: 'Degen',
    emoji: '🎰',
    description: 'Risk-taker and high-stakes player',
  },
  SUGAR_DADDY: {
    label: 'Sugar Daddy',
    emoji: '💰',
    description: 'Financial backer and supporter',
  },
  ALPHA_CALLER: {
    label: 'Alpha Caller',
    emoji: '📢',
    description: 'Finds and shares alpha opportunities',
  },
  TRADER: {
    label: 'Trader',
    emoji: '📈',
    description: 'Executes trades and manages positions',
  },
  DEV: {
    label: 'Dev',
    emoji: '💻',
    description: 'Technical builder and developer',
  },
  VIBE_CODER: {
    label: 'Vibe Coder',
    emoji: '🎨',
    description: 'Creative developer with style',
  },
  KOL: {
    label: 'KOL',
    emoji: '🌟',
    description: 'Key Opinion Leader with influence',
  },
};

// Squad creation limits based on Ethos score
export function calculateSquadCreationLimit(ethosScore: number | null, isValidator: boolean = false): number {
  const baseLimit = (() => {
    if (!ethosScore) return 1;
    if (ethosScore >= 2000) return 5;
    if (ethosScore >= 1800) return 4;
    if (ethosScore >= 1600) return 3;
    if (ethosScore >= 1400) return 2;
    return 1;
  })();

  // Validator bonus (placeholder for future implementation)
  return isValidator ? baseLimit + 1 : baseLimit;
}

// Constants
export const SQUAD_MIN_SIZE = 2;
export const SQUAD_MAX_SIZE = 7;
export const INVITE_EXPIRY_DAYS = 7;
