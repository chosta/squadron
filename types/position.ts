import type { User } from './index';
import type { Squad, SquadRole } from './squad';

// Enums matching Prisma schema
export type EthosScoreTier =
  | 'BELOW_1400'
  | 'TIER_1400'
  | 'TIER_1500'
  | 'TIER_1600'
  | 'TIER_1700'
  | 'TIER_1800'
  | 'TIER_1900'
  | 'TIER_2000_PLUS';

export type ApplicationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export type NotificationType =
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_EXPIRED'
  | 'POSITION_DELETED';

export type Benefit = 'EQUITY' | 'CASH' | 'TIPS' | 'EXPOSURE' | 'MUTUAL' | 'FUN';

// Benefit configuration
export interface BenefitConfig {
  label: string;
  emoji: string;
}

export const BENEFITS: Record<Benefit, BenefitConfig> = {
  EQUITY: { label: 'Equity', emoji: '📈' },
  CASH: { label: 'Cash', emoji: '💵' },
  TIPS: { label: 'Tips', emoji: '💰' },
  EXPOSURE: { label: 'Exposure', emoji: '📣' },
  MUTUAL: { label: 'Mutual', emoji: '🤝' },
  FUN: { label: 'Fun', emoji: '🎉' },
};

// Ethos score tier configuration
export interface EthosScoreTierConfig {
  label: string;
  min: number;
}

export const ETHOS_SCORE_TIERS: Record<EthosScoreTier, EthosScoreTierConfig> = {
  BELOW_1400: { label: 'Any Score', min: 0 },
  TIER_1400: { label: '1400+', min: 1400 },
  TIER_1500: { label: '1500+', min: 1500 },
  TIER_1600: { label: '1600+', min: 1600 },
  TIER_1700: { label: '1700+', min: 1700 },
  TIER_1800: { label: '1800+', min: 1800 },
  TIER_1900: { label: '1900+', min: 1900 },
  TIER_2000_PLUS: { label: '2000+', min: 2000 },
};

// Base interfaces
export interface OpenPosition {
  id: string;
  createdAt: string;
  updatedAt: string;
  squadId: string;
  role: SquadRole;
  description: string | null;
  ethosScoreTier: EthosScoreTier;
  requiresMutualVouch: boolean;
  benefits: Benefit[];
  expiresAt: string;
  isOpen: boolean;
}

export interface Application {
  id: string;
  createdAt: string;
  updatedAt: string;
  positionId: string;
  applicantId: string;
  message: string | null;
  status: ApplicationStatus;
  expiresAt: string;
  respondedAt: string | null;
}

export interface Notification {
  id: string;
  createdAt: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  squadId: string | null;
  positionId: string | null;
  applicationId: string | null;
}

// User subset for relations
type UserBasic = Pick<User, 'id' | 'ethosProfileId' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl' | 'ethosScore'>;

// Extended types with relations
export interface OpenPositionWithSquad extends OpenPosition {
  squad: Pick<Squad, 'id' | 'name' | 'avatarUrl'> & {
    _count?: { members: number };
    captain?: UserBasic;
  };
  _count?: { applications: number };
}

export interface OpenPositionWithApplications extends OpenPosition {
  applications: ApplicationWithApplicant[];
  _count?: { applications: number };
}

export interface ApplicationWithApplicant extends Application {
  applicant: UserBasic;
}

export interface ApplicationWithPosition extends Application {
  position: OpenPositionWithSquad;
}

// Input types
export interface CreatePositionInput {
  role: SquadRole;
  description?: string;
  ethosScoreTier?: EthosScoreTier;
  requiresMutualVouch?: boolean;
  benefits?: Benefit[];
}

export interface ApplyToPositionInput {
  message?: string;
}

// Eligibility result
export interface PositionEligibility {
  eligible: boolean;
  meetsScoreRequirement: boolean;
  meetsMutualVouchRequirement: boolean;
  userScore: number | null;
  requiredMinScore: number;
  requiresMutualVouch: boolean;
  hasMutualVouch: boolean;
  isAlreadyMember: boolean;
  hasExistingApplication: boolean;
}

// Notification input
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  squadId?: string;
  positionId?: string;
  applicationId?: string;
}

// Filter options
export interface ListPositionsFilter {
  role?: SquadRole;
  ethosScoreTier?: EthosScoreTier;
  benefits?: Benefit[];
  limit?: number;
  offset?: number;
}

// Constants
export const POSITION_EXPIRY_DAYS = 30;
export const APPLICATION_EXPIRY_DAYS = 7;

// Helper to check if user meets tier requirement
export function meetsScoreTier(userScore: number | null, tier: EthosScoreTier): boolean {
  const minScore = ETHOS_SCORE_TIERS[tier].min;
  return (userScore ?? 0) >= minScore;
}

// Helper to get expiry date
export function getPositionExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + POSITION_EXPIRY_DAYS);
  return date;
}

export function getApplicationExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + APPLICATION_EXPIRY_DAYS);
  return date;
}
