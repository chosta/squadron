/**
 * Ethos Network API v2 Types
 * These types represent the data structure from the Ethos Network API
 */

export type EthosUserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface EthosUserStats {
  review: {
    received: {
      negative: number;
      neutral: number;
      positive: number;
    };
  };
  vouch: {
    given: {
      amountWeiTotal: string;
      count: number;
    };
    received: {
      amountWeiTotal: string;
      count: number;
    };
  };
}

export interface EthosUser {
  id: number;
  profileId: number;
  displayName: string;
  username: string;
  avatarUrl: string;
  description: string;
  score: number;
  status: EthosUserStatus;
  userkeys: string[];
  xpTotal: number;
  xpStreakDays: number;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: {
    profile: string;
    scoreBreakdown: string;
  };
  stats: EthosUserStats;
}

export interface EthosSocialAccounts {
  xHandle?: string;
  xId?: string;
  discordId?: string;
  farcasterId?: string;
  telegramId?: string;
  wallets: string[];
}

/**
 * Userkey formats:
 * - profileId:<id>
 * - address:<addr>
 * - service:x.com:username:<handle>
 * - service:x.com:<id>
 * - service:discord:<id>
 * - service:farcaster:<id>
 * - service:telegram:<id>
 */
export type EthosUserkey = string;

/**
 * Fields that cannot be edited by users - synced from Ethos only
 */
export const ETHOS_READONLY_FIELDS = [
  'ethosProfileId',
  'ethosUserId',
  'ethosUsername',
  'ethosDisplayName',
  'ethosAvatarUrl',
  'ethosDescription',
  'ethosScore',
  'ethosStatus',
  'ethosXHandle',
  'ethosXId',
  'ethosDiscordId',
  'ethosFarcasterId',
  'ethosTelegramId',
  'ethosPrimaryWallet',
  'ethosWallets',
  'ethosXpTotal',
  'ethosXpStreakDays',
  'ethosInfluenceFactor',
  'ethosInfluencePercentile',
  'ethosUserkeys',
  'ethosRawData',
  'ethosLastSyncedAt',
] as const;

export type EthosReadonlyField = typeof ETHOS_READONLY_FIELDS[number];

export interface EthosApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ValidatorNft {
  contractAddress: string;
  tokenId: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}
