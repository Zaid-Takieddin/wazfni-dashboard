import type {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  ChangePasswordRequest,
} from 'src/types/auth';

import axiosInstance, { endpoints, tokenManager } from '../axios';

// ----------------------------------------------------------------------

// Persistent error logging
const logError = (message: string, error: any) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message,
    error: error?.message || error,
    stack: error?.stack,
    response: error?.response?.data,
    status: error?.response?.status,
    details: error,
  };

  if (typeof window !== 'undefined') {
    const existingErrors = JSON.parse(localStorage.getItem('auth_error_logs') || '[]');
    existingErrors.push(errorLog);

    // Keep only last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10);
    }

    localStorage.setItem('auth_error_logs', JSON.stringify(existingErrors));
  }

  console.error(`🔥 AuthService: ${message}`, error);
};

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(endpoints.auth.login, data);

    if (response.data.token) {
      tokenManager.setToken(response.data.token);

      // Store user role information from login response
      if (response.data.user && typeof window !== 'undefined') {
        localStorage.setItem('userRole', response.data.user.role || 'USER');
        localStorage.setItem('userEmail', response.data.user.email || '');
      }
    }

    return response.data;
  }

  /**
   * Register new user
   */
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post<RegisterResponse>(endpoints.auth.register, data);

    if (response.data.token) {
      tokenManager.setToken(response.data.token);

      // Store user role information from register response
      if (response.data.user && typeof window !== 'undefined') {
        localStorage.setItem('userRole', response.data.user.role || 'USER');
        localStorage.setItem('userEmail', response.data.user.email || '');
      }
    }

    return response.data;
  }

  /**
   * Login with Google OAuth
   */
  static async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(endpoints.auth.googleLogin, data);

    if (response.data.token) {
      tokenManager.setToken(response.data.token);

      // Store user role information from Google login response
      if (response.data.user && typeof window !== 'undefined') {
        localStorage.setItem('userRole', response.data.user.role || 'USER');
        localStorage.setItem('userEmail', response.data.user.email || '');
      }
    }

    return response.data;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await axiosInstance.get<User>(endpoints.auth.me);

    // The API returns profile data, enhance it with stored user data
    const profileData = response.data;

    // Get stored user data from login
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    // Enhance the profile data with computed fields
    const user: User = {
      ...profileData,
      role: (storedRole as UserRole) || 'USER',
      isActive: true,
      email: storedEmail || '',
    };

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    await axiosInstance.patch(endpoints.auth.changePassword, data);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await axiosInstance.post(endpoints.auth.logout);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      tokenManager.removeToken();
      // Clear stored user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = tokenManager.getToken();
    return !!token;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN';
  }

  /**
   * Get stored user role
   */
  static getStoredRole(): UserRole | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userRole') as UserRole;
  }

  /**
   * Validate token and get user
   */
  static async validateToken(): Promise<User | null> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return null;
      }

      const user = await this.getProfile();
      return user;
    } catch (error) {
      // Token is invalid, remove it
      tokenManager.removeToken();
      return null;
    }
  }

  /**
   * Clear authentication state
   */
  static clearAuth(): void {
    tokenManager.removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
    }
  }
}
