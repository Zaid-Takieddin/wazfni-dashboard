import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { UserService } from '../services/user.service';

import type {
  UserFilters,
  UsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserProfileRequest,
} from '../../types/user';

// ----------------------------------------------------------------------

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: (id: string) => [...userKeys.all, 'profile', id] as const,
  myProfile: () => [...userKeys.all, 'myProfile'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

// ===== USER MANAGEMENT HOOKS (ADMIN) =====

/**
 * Get all users with filters and pagination (Admin only)
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: () => UserService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: UsersResponse) => ({
      users: data.data,
      pagination: data.pagination,
    }),
  });
}

/**
 * Get single user by ID (Admin only)
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => UserService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      user: data.user,
      profile: data.profile,
    }),
  });
}

/**
 * Get user statistics (Admin only)
 */
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => UserService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Search users (Admin only)
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => UserService.searchUsers(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create user (Admin only)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => UserService.createUser(data),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      // Add the new user to cache
      queryClient.setQueryData(userKeys.detail(newUser.id), { user: newUser });

      console.log('User created successfully:', newUser);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

/**
 * Update user (Admin only)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      UserService.updateUser(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(userId), { user: updatedUser });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      console.log('User updated successfully:', updatedUser);
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}

/**
 * Delete user (Admin only)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      queryClient.removeQueries({ queryKey: userKeys.profile(userId) });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      console.log('User deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
}

/**
 * Toggle user verification status (Admin only)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      UserService.toggleUserStatus(userId, isActive),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(userId), { user: updatedUser });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      console.log('User status updated successfully:', updatedUser);
    },
    onError: (error) => {
      console.error('Failed to update user status:', error);
    },
  });
}

/**
 * Update user role (Admin only)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      UserService.updateUserRole(userId, role),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(userId), { user: updatedUser });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      console.log('User role updated successfully:', updatedUser);
    },
    onError: (error) => {
      console.error('Failed to update user role:', error);
    },
  });
}

// ===== PROFILE HOOKS =====

/**
 * Get my profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.myProfile(),
    queryFn: () => UserService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user profile by ID
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => UserService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update my profile
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => UserService.updateMyProfile(data),
    onSuccess: (updatedProfile) => {
      // Update my profile in cache
      queryClient.setQueryData(userKeys.myProfile(), updatedProfile);

      console.log('Profile updated successfully:', updatedProfile);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
}

/**
 * Export users (Admin only)
 */
export function useExportUsers() {
  return useMutation({
    mutationFn: (filters?: UserFilters) => UserService.exportUsers(filters),
    onError: (error) => {
      console.error('Failed to export users:', error);
    },
  });
}
