import axiosInstance from '../axios';

import type {
  UserStats,
  UserProfile,
  UserFilters,
  UsersResponse,
  UserManagement,
  UserPermissions,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserProfileRequest,
} from '../../types/user';

// ----------------------------------------------------------------------

export class UserService {
  // ===== USER MANAGEMENT (ADMIN) =====

  /**
   * Get user statistics (Admin only)
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await axiosInstance.get('/users/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination and filtering (Admin only)
   */
  static async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();

      // Pagination
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      // Sorting
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      // Filtering
      if (filters?.role) {
        params.append('role', filters.role);
      }
      if (filters?.isVerified !== undefined) {
        params.append('isVerified', filters.isVerified.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/users/admin/users?${queryString}` : '/users/admin/users';

      const response = await axiosInstance.get(endpoint);

      // Handle different response structures
      if (response.data?.data && response.data?.pagination) {
        // Paginated response structure
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      } else if (Array.isArray(response.data)) {
        // Simple array response - create pagination structure
        const data = response.data;
        return {
          data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else {
        console.warn('Unexpected users response structure:', response.data);
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    } catch (error) {
      console.error('UserService.getUsers error:', error);
      throw error;
    }
  }

  /**
   * Get single user details by ID (Admin only)
   */
  static async getUser(userId: string): Promise<{
    user: UserManagement;
    profile?: UserProfile;
  }> {
    try {
      const response = await axiosInstance.get(`/users/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('UserService.getUser error:', error);
      throw error;
    }
  }

  /**
   * Create new user (Admin only)
   */
  static async createUser(data: CreateUserRequest): Promise<UserManagement> {
    try {
      const response = await axiosInstance.post('/users/admin/users', {
        email: data.email,
        password: data.password,
        role: data.role || 'USER',
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        isVerified: data.isVerified ?? true, // Admin created users are verified by default
      });
      return response.data.user;
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw error;
    }
  }

  /**
   * Update user (Admin only)
   */
  static async updateUser(userId: string, data: UpdateUserRequest): Promise<UserManagement> {
    try {
      const updateData: any = {};

      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.password !== undefined) updateData.password = data.password;

      const response = await axiosInstance.patch(`/users/admin/users/${userId}`, updateData);
      return response.data.user;
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      throw error;
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/users/admin/users/${userId}`);
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  }

  /**
   * Toggle user verification status (Admin only)
   */
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<UserManagement> {
    try {
      const response = await axiosInstance.patch(`/users/admin/users/${userId}`, {
        isVerified: isActive,
      });
      return response.data.user;
    } catch (error) {
      console.error('UserService.toggleUserStatus error:', error);
      throw error;
    }
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(userId: string, role: string): Promise<UserManagement> {
    try {
      const response = await axiosInstance.patch(`/users/admin/users/${userId}`, {
        role,
      });
      return response.data.user;
    } catch (error) {
      console.error('UserService.updateUserRole error:', error);
      throw error;
    }
  }

  // ===== PROFILE MANAGEMENT =====

  /**
   * Get current user profile
   */
  static async getMyProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get('/users/profile/me');
      return response.data;
    } catch (error) {
      console.error('UserService.getMyProfile error:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  static async updateMyProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      const response = await axiosInstance.patch('/users/profile/me', data);
      return response.data;
    } catch (error) {
      console.error('UserService.updateMyProfile error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('UserService.getUserProfile error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (simplified version)
   */
  static async getUserById(userId: string): Promise<UserManagement> {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      throw error;
    }
  }

  // ===== PERMISSIONS =====

  /**
   * Get user permissions based on role
   */
  static getUserPermissions(userRole?: string): UserPermissions {
    const isAdmin = userRole === 'ADMIN';

    return {
      canViewUsers: isAdmin,
      canCreateUsers: isAdmin,
      canUpdateUsers: isAdmin,
      canDeleteUsers: isAdmin,
      canManageRoles: isAdmin,
      canDeactivateUsers: isAdmin,
      canExportUsers: isAdmin,
    };
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: keyof UserPermissions, userRole?: string): boolean {
    const permissions = this.getUserPermissions(userRole);
    return permissions[permission];
  }

  // ===== UTILITY METHODS =====

  /**
   * Search users (Admin only)
   */
  static async searchUsers(query: string): Promise<UserManagement[]> {
    try {
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('UserService.searchUsers error:', error);
      throw error;
    }
  }

  /**
   * Export users data (Admin only)
   */
  static async exportUsers(filters?: UserFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (filters?.role) params.append('role', filters.role);
      if (filters?.isVerified !== undefined) {
        params.append('isVerified', filters.isVerified.toString());
      }
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = queryString ? `/users/export?${queryString}` : '/users/export';

      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('UserService.exportUsers error:', error);
      throw error;
    }
  }
}
