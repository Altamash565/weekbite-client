import { apiClient, clearAuthSession } from '../../../shared/api/api-client';
import { User, RegisterDto, LoginDto, UpdateProfileDto } from '../types/auth.types';

// Helper to extract User object from various backend response shapes (e.g. { user }, { data: { user } }, { data })
function extractUserFromResponse(response: unknown): User {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid server response');
  }

  const res = response as Record<string, unknown>;

  if (res.user && typeof res.user === 'object') {
    return res.user as User;
  }

  if (res.data && typeof res.data === 'object') {
    const dataObj = res.data as Record<string, unknown>;
    if (dataObj.user && typeof dataObj.user === 'object') {
      return dataObj.user as User;
    }
    if ('email' in dataObj) {
      return dataObj as unknown as User;
    }
  }

  if ('email' in res) {
    return res as unknown as User;
  }

  throw new Error('User profile not found in response');
}

export const authApi = {
  /**
   * 1. Register: Registers a new user account (POST /auth/register)
   */
  async register(dto: RegisterDto): Promise<User> {
    const response = await apiClient.post<unknown>('/auth/register', dto);
    return extractUserFromResponse(response);
  },

  /**
   * 2. Login: Authenticates user, sets accessToken & refreshToken cookies (POST /auth/login)
   */
  async login(dto: LoginDto): Promise<User> {
    const response = await apiClient.post<unknown>('/auth/login', dto);
    return extractUserFromResponse(response);
  },

  /**
   * 3. Get Current User: Fetches logged-in user profile using cookie/token (GET /auth/me)
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<unknown>('/auth/me');
    return extractUserFromResponse(response);
  },

  /**
   * 4. Refresh Token: Exchanges refreshToken cookie for new tokens (POST /auth/refresh)
   */
  async refresh(): Promise<void> {
    await apiClient.post<unknown>('/auth/refresh', undefined, { skipAuthRefresh: true });
  },

  /**
   * 5. Update Profile: Updates current user name and/or avatar (PATCH /auth/profile)
   */
  async updateProfile(dto: UpdateProfileDto): Promise<User> {
    const response = await apiClient.patch<unknown>('/auth/profile', dto);
    return extractUserFromResponse(response);
  },

  /**
   * 6. Logout: Invalidates refresh token on server and clears client session (POST /auth/logout)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<unknown>('/auth/logout');
    } finally {
      await clearAuthSession();
    }
  },
};

