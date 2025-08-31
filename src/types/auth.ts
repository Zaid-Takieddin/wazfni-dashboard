// ----------------------------------------------------------------------

export type UserRole = 'USER' | 'ADMIN' | 'COMPANY';

export type WorkExperience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type EducationCertificate = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type User = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  educationCertificate?: string | null;
  cv?: string | null;
  avatar?: string | null;
  phone: string;
  city?: string | null;
  address?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  createdAt: string;
  updatedAt: string;
  workExperiences: WorkExperience[];
  educationCertificates: EducationCertificate[];
  // Computed fields
  email?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UserProfile = {
  id: string;
  jobTitle?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  avatarUrl?: string;
  cvUrl?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

export type RegisterResponse = {
  user: User;
  token: string;
};

export type GoogleLoginRequest = {
  googleToken: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isCompany: boolean;
  permissions: import('../types/user').UserPermissions;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
};
