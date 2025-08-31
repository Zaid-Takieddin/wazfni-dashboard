import type { PaginationParams, PaginatedResponse } from './common';
import type { UserRole, WorkExperience, EducationCertificate } from './auth';

// ----------------------------------------------------------------------

// Extended User type for admin management
export type UserManagement = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    firstName: string;
    lastName: string;
    jobTitle?: string;
    city?: string;
    avatar?: string;
  };
  company?: {
    id: string;
    name: string;
    workField: string;
    approvalStatus: string;
  };
  _count?: {
    applications: number;
    bookmarks: number;
  };
};

export type UserProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  avatar?: string;
  cv?: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  workExperiences: WorkExperience[];
  educationCertificates: EducationCertificate[];
};

// API Request Types
export type CreateUserRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
  isVerified?: boolean;
};

export type UpdateUserRequest = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isVerified?: boolean;
};

export type UpdateUserProfileRequest = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  phone?: string;
};

export type UserFilters = PaginationParams & {
  role?: UserRole;
  isVerified?: boolean;
  search?: string;
};

// API Response Types
export type UserResponse = {
  message: string;
  user: UserManagement;
};

export type UsersResponse = PaginatedResponse<UserManagement>;

export type UserProfileResponse = {
  data: UserProfile;
  message: string;
  status: number;
};

export type UserStatsResponse = {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  regularUsers: number;
  usersWithCompanies: number;
  usersWithoutCompanies: number;
  recentUsers: number;
};

// Form Types
export type UserFormData = CreateUserRequest;
export type UserEditFormData = UpdateUserRequest;
export type UserProfileFormData = UpdateUserProfileRequest;

// Role-based permissions
export type UserPermissions = {
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canManageRoles: boolean;
  canDeactivateUsers: boolean;
  canExportUsers: boolean;
};

// Table row type for DataGrid
export type UserTableRow = UserManagement & {
  fullName: string;
  roleLabel: string;
  statusLabel: string;
  lastLoginFormatted: string;
};

export type UserStats = {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  regularUsers: number;
  usersWithCompanies: number;
  usersWithoutCompanies: number;
  recentUsers: number;
};
