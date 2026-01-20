import type { User, CreateUserInput, UpdateUserInput, ApiResponse, PaginationParams } from '@/types';
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
}

export const apiClient = new ApiClient();
