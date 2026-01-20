import type { EthosUserStats } from './ethos';
import type { UserRole, UserStatus } from './index';

/**
 * User preferences that can be customized
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Ethos data subset for the user profile
 */
export interface EthosData {
  profileId: number | null;
  userId: number | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  description: string | null;
  score: number | null;
  status: string | null;
  xHandle: string | null;
  xId: string | null;
  discordId: string | null;
  farcasterId: string | null;
  telegramId: string | null;
  primaryWallet: string | null;
  wallets: string[];
  xpTotal: number | null;
  xpStreakDays: number | null;
  influenceFactor: number | null;
  influencePercentile: number | null;
  userkeys: string[];
  stats: EthosUserStats | null;
  lastSyncedAt: Date | null;
}

/**
 * User with Ethos data - returned from API endpoints
 */
export interface UserWithEthos {
  id: string;
  privyId: string;
  privyDid: string | null;
  ethosData: EthosData;
  // Editable fields
  email: string | null;
  customDisplayName: string | null;
  preferences: UserPreferences | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth method used for login
 */
export type AuthMethod = 'wallet' | 'twitter';

/**
 * Auth sync request payload
 */
export interface AuthSyncRequest {
  authMethod: AuthMethod;
  walletAddress?: string;  // for wallet auth
  xHandle?: string;        // for twitter auth
  privyDid?: string;
}

/**
 * Auth sync response
 */
export interface AuthSyncResponse {
  success: boolean;
  user?: UserWithEthos;
  error?: 'ETHOS_PROFILE_REQUIRED' | 'AUTH_FAILED' | 'INTERNAL_ERROR';
  message?: string;
}

/**
 * Session data stored in cookies/tokens
 */
export interface SessionData {
  userId: string;
  privyId: string;
  ethosProfileId: number | null;
}

/**
 * Editable user fields - only these can be updated by the user
 */
export const EDITABLE_USER_FIELDS = [
  'email',
  'customDisplayName',
  'preferences',
] as const;

export type EditableUserField = typeof EDITABLE_USER_FIELDS[number];

/**
 * Update user request - only editable fields allowed
 */
export interface UpdateUserRequest {
  email?: string;
  customDisplayName?: string;
  preferences?: UserPreferences;
}
