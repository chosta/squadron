export type UserRole = 'ADMIN' | 'USER' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface User {
  id: string;
  privyId: string;
  privyDid: string | null;
  // Ethos fields
  ethosProfileId: number | null;
  ethosUserId: number | null;
  ethosUsername: string | null;
  ethosDisplayName: string | null;
  ethosAvatarUrl: string | null;
  ethosDescription: string | null;
  ethosScore: number | null;
  ethosStatus: string | null;
  ethosXHandle: string | null;
  ethosXId: string | null;
  ethosDiscordId: string | null;
  ethosFarcasterId: string | null;
  ethosTelegramId: string | null;
  ethosPrimaryWallet: string | null;
  ethosWallets: string[];
  ethosXpTotal: number | null;
  ethosXpStreakDays: number | null;
  ethosInfluenceFactor: number | null;
  ethosInfluencePercentile: number | null;
  ethosUserkeys: string[];
  ethosRawData: unknown;
  ethosLastSyncedAt: string | null;
  // App fields
  email: string | null;
  customDisplayName: string | null;
  preferences: unknown;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  privyId: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  email?: string;
  customDisplayName?: string;
  preferences?: Record<string, unknown>;
  role?: UserRole;
  status?: UserStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
