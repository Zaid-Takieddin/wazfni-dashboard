import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  ChangePasswordRequest,
} from 'src/types/auth';

import { AuthService } from '../services/auth.service';

// ----------------------------------------------------------------------

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// ----------------------------------------------------------------------

/**
 * Hook to get current user profile
 */
export function useGetProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: AuthService.getProfile,
    enabled: AuthService.isAuthenticated(),
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: (response: LoginResponse) => {
      // Cache user data
      queryClient.setQueryData(authKeys.profile(), response.user);

      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to dashboard
      router.push(paths.dashboard.root);
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (response: RegisterResponse) => {
      // Cache user data
      queryClient.setQueryData(authKeys.profile(), response.user);

      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to dashboard
      router.push(paths.dashboard.root);
    },
    onError: (error: any) => {
      console.error('Register failed:', error);
    },
  });
}

/**
 * Hook for Google login mutation
 */
export function useGoogleLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoogleLoginRequest) => AuthService.loginWithGoogle(data),
    onSuccess: (response: LoginResponse) => {
      // Cache user data
      queryClient.setQueryData(authKeys.profile(), response.user);

      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to dashboard
      router.push(paths.dashboard.root);
    },
    onError: (error: any) => {
      console.error('Google login failed:', error);
    },
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Redirect to login
      router.push(paths.auth.signIn);
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Force clear cache even if logout fails
      queryClient.clear();
      router.push(paths.auth.signIn);
    },
  });
}

/**
 * Hook for change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => AuthService.changePassword(data),
    onError: (error: any) => {
      console.error('Change password failed:', error);
    },
  });
}

/**
 * Hook to validate token and get user
 */
export function useValidateToken() {
  return useQuery({
    queryKey: [...authKeys.profile(), 'validate'],
    queryFn: AuthService.validateToken,
    enabled: AuthService.isAuthenticated(),
    retry: false,
    staleTime: 0, // Always fresh
  });
}
