import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { LoginDto, RegisterDto, UpdateProfileDto, User } from '../types/auth.types';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

/**
 * Hook to retrieve current logged-in user profile (GET /auth/me)
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        // If unauthenticated or 401, return null
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Hook for login mutation (POST /auth/login)
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, LoginDto>({
    mutationFn: (dto) => authApi.login(dto),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

/**
 * Hook for register mutation (POST /auth/register)
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, RegisterDto>({
    mutationFn: (dto) => authApi.register(dto),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

/**
 * Hook for logout mutation (POST /auth/logout)
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

/**
 * Hook for update profile mutation (PATCH /auth/profile)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileDto>({
    mutationFn: (dto) => authApi.updateProfile(dto),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
    },
  });
}

