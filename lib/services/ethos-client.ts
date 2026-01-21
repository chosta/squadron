import type { EthosUser, EthosSocialAccounts, EthosApiResponse, ValidatorNft } from '@/types/ethos';

const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';

/**
 * Ethos Network API Client
 * Singleton wrapper for interacting with the Ethos Network API v2
 */
export class EthosClient {
  private static instance: EthosClient;
  private clientId: string;

  private constructor() {
    this.clientId = process.env.ETHOS_CLIENT_ID || 'squadron@1.0.0';
  }

  static getInstance(): EthosClient {
    if (!EthosClient.instance) {
      EthosClient.instance = new EthosClient();
    }
    return EthosClient.instance;
  }

  private async request<T>(endpoint: string): Promise<EthosApiResponse<T>> {
    try {
      const response = await fetch(`${ETHOS_API_BASE}${endpoint}`, {
        headers: {
          'X-Ethos-Client': this.clientId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { ok: false, error: 'NOT_FOUND' };
        }
        return { ok: false, error: `API_ERROR_${response.status}` };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.error('Ethos API error:', error);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  /**
   * Get user by Ethereum wallet address - primary lookup after wallet auth
   */
  async getUserByAddress(address: string): Promise<EthosApiResponse<EthosUser>> {
    const normalizedAddress = address.toLowerCase();
    return this.request<EthosUser>(`/user/by/address/${normalizedAddress}`);
  }

  /**
   * Get user by Ethos user ID
   */
  async getUserById(userId: number): Promise<EthosApiResponse<EthosUser>> {
    return this.request<EthosUser>(`/user/${userId}`);
  }

  /**
   * Get user by Twitter/X handle
   */
  async getUserByXHandle(handle: string): Promise<EthosApiResponse<EthosUser>> {
    const normalizedHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    return this.request<EthosUser>(`/user/by/x/${normalizedHandle}`);
  }

  /**
   * Get user by profile ID
   */
  async getUserByProfileId(profileId: number): Promise<EthosApiResponse<EthosUser>> {
    return this.request<EthosUser>(`/user/by/profileId/${profileId}`);
  }

  /**
   * Check if user owns a validator NFT
   * Returns an array of validator NFT objects (empty if none owned)
   * @param ethosUserKey - e.g., "profileId:123"
   */
  async checkOwnsValidator(ethosUserKey: string): Promise<EthosApiResponse<ValidatorNft[]>> {
    return this.request<ValidatorNft[]>(
      `/nfts/user/${encodeURIComponent(ethosUserKey)}/owns-validator`
    );
  }

  /**
   * Parse userkeys array to extract social accounts and wallets
   *
   * Userkey formats:
   * - address:<addr> - Ethereum wallet
   * - service:x.com:username:<handle> - Twitter/X username
   * - service:x.com:<id> - Twitter/X numeric ID
   * - service:discord:<id> - Discord ID
   * - service:farcaster:<id> - Farcaster ID
   * - service:telegram:<id> - Telegram ID
   */
  static parseUserkeys(userkeys: string[]): EthosSocialAccounts {
    const result: EthosSocialAccounts = { wallets: [] };

    for (const key of userkeys) {
      if (key.startsWith('address:')) {
        result.wallets.push(key.replace('address:', ''));
      } else if (key.startsWith('service:x.com:username:')) {
        result.xHandle = key.replace('service:x.com:username:', '');
      } else if (key.startsWith('service:x.com:')) {
        result.xId = key.replace('service:x.com:', '');
      } else if (key.startsWith('service:discord:')) {
        result.discordId = key.replace('service:discord:', '');
      } else if (key.startsWith('service:farcaster:')) {
        result.farcasterId = key.replace('service:farcaster:', '');
      } else if (key.startsWith('service:telegram:')) {
        result.telegramId = key.replace('service:telegram:', '');
      }
    }

    return result;
  }

  /**
   * Convert Ethos user data to database fields
   */
  static toDbFields(ethosUser: EthosUser): Record<string, unknown> {
    const socialAccounts = EthosClient.parseUserkeys(ethosUser.userkeys);

    return {
      ethosProfileId: ethosUser.profileId,
      ethosUserId: ethosUser.id,
      ethosUsername: ethosUser.username,
      ethosDisplayName: ethosUser.displayName,
      ethosAvatarUrl: ethosUser.avatarUrl,
      ethosDescription: ethosUser.description,
      ethosScore: ethosUser.score,
      ethosStatus: ethosUser.status,
      ethosXHandle: socialAccounts.xHandle,
      ethosXId: socialAccounts.xId,
      ethosDiscordId: socialAccounts.discordId,
      ethosFarcasterId: socialAccounts.farcasterId,
      ethosTelegramId: socialAccounts.telegramId,
      ethosPrimaryWallet: socialAccounts.wallets[0] || null,
      ethosWallets: socialAccounts.wallets,
      ethosXpTotal: ethosUser.xpTotal,
      ethosXpStreakDays: ethosUser.xpStreakDays,
      ethosInfluenceFactor: ethosUser.influenceFactor,
      ethosInfluencePercentile: ethosUser.influenceFactorPercentile,
      ethosUserkeys: ethosUser.userkeys,
      ethosRawData: ethosUser,
      ethosLastSyncedAt: new Date(),
    };
  }
}

// Export singleton instance
export const ethosClient = EthosClient.getInstance();
