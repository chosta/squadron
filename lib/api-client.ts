import type { User, CreateUserInput, UpdateUserInput, ApiResponse, PaginationParams } from '@/types';
import type {
  SquadWithMembers,
  SquadInviteWithDetails,
  CreateSquadInput,
  UpdateSquadInput,
  SquadRole,
  SquadMember,
  SquadCreationEligibility,
  AcceptInviteResult,
  SquadInvite,
} from '@/types/squad';
import { getBaseUrl } from './config';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return this.request<User[]>(`/api/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`);
  }

  async createUser(input: CreateUserInput): Promise<ApiResponse<User>> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Squads ====================

  async getSquads(params?: PaginationParams & { activeOnly?: boolean }): Promise<ApiResponse<SquadWithMembers[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.activeOnly) searchParams.set('activeOnly', 'true');

    const query = searchParams.toString();
    return this.request<SquadWithMembers[]>(`/api/squads${query ? `?${query}` : ''}`);
  }

  async getSquad(id: string): Promise<ApiResponse<SquadWithMembers>> {
    return this.request<SquadWithMembers>(`/api/squads/${id}`);
  }

  async createSquad(input: CreateSquadInput): Promise<ApiResponse<SquadWithMembers>> {
    return this.request<SquadWithMembers>('/api/squads', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateSquad(id: string, input: UpdateSquadInput): Promise<ApiResponse<SquadWithMembers>> {
    return this.request<SquadWithMembers>(`/api/squads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteSquad(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/squads/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Squad Members ====================

  async removeMember(squadId: string, memberId: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/squads/${squadId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async changeMemberRole(squadId: string, memberId: string, role: SquadRole): Promise<ApiResponse<SquadMember>> {
    return this.request<SquadMember>(`/api/squads/${squadId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async transferCaptaincy(squadId: string, newCaptainId: string): Promise<ApiResponse<SquadWithMembers>> {
    return this.request<SquadWithMembers>(`/api/squads/${squadId}/captain`, {
      method: 'PUT',
      body: JSON.stringify({ newCaptainId }),
    });
  }

  async leaveSquad(squadId: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/api/squads/${squadId}/leave`, {
      method: 'POST',
    });
  }

  // ==================== Invites ====================

  async createInvite(
    squadId: string,
    inviteeId: string,
    role: SquadRole,
    message?: string
  ): Promise<ApiResponse<SquadInviteWithDetails>> {
    return this.request<SquadInviteWithDetails>(`/api/squads/${squadId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ inviteeId, role, message }),
    });
  }

  async getSquadInvites(squadId: string): Promise<ApiResponse<SquadInviteWithDetails[]>> {
    return this.request<SquadInviteWithDetails[]>(`/api/squads/${squadId}/invites`);
  }

  async getMyInvites(): Promise<ApiResponse<SquadInviteWithDetails[]>> {
    return this.request<SquadInviteWithDetails[]>('/api/invites');
  }

  async getInvite(id: string): Promise<ApiResponse<SquadInviteWithDetails>> {
    return this.request<SquadInviteWithDetails>(`/api/invites/${id}`);
  }

  async acceptInvite(id: string): Promise<ApiResponse<AcceptInviteResult>> {
    return this.request<AcceptInviteResult>(`/api/invites/${id}/accept`, {
      method: 'POST',
    });
  }

  async declineInvite(id: string): Promise<ApiResponse<SquadInvite>> {
    return this.request<SquadInvite>(`/api/invites/${id}/decline`, {
      method: 'POST',
    });
  }

  async cancelInvite(id: string): Promise<ApiResponse<SquadInvite>> {
    return this.request<SquadInvite>(`/api/invites/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== User Squads ====================

  async getMySquads(): Promise<ApiResponse<SquadWithMembers[]>> {
    return this.request<SquadWithMembers[]>('/api/users/me/squads');
  }

  async getSquadEligibility(): Promise<ApiResponse<SquadCreationEligibility>> {
    return this.request<SquadCreationEligibility>('/api/users/me/squads/eligibility');
  }
}

export const apiClient = new ApiClient();
