import type { PaginationParams, PaginatedResponse } from './common';

// ----------------------------------------------------------------------

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Company = {
  id: string;
  name: string;
  workField: string;
  description?: string;
  location: string;
  size: string;
  website?: string;
  city: string;
  commercial_register: string;
  tax_number: string;
  logo?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export type Job = {
  id: string;
  jobTitle: string;
  description: string;
  requirements?: string;
  workType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  contractType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'EXPERT';
  experienceYears?: number;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryType?: 'RANGE' | 'FIXED' | 'NEGOTIABLE';
  jobFeatures?: string[];
  questions?: string[];
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  company?: Company;
  subCategories?: Array<{
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  }>;
};

export type CompanyFilters = PaginationParams & {
  approvalStatus?: ApprovalStatus;
  workField?: string;
  city?: string;
  search?: string;
};

export type JobFilters = PaginationParams & {
  approvalStatus?: ApprovalStatus;
  workType?: string;
  contractType?: string;
  experienceLevel?: string;
  subCategoryId?: string;
  search?: string;
};

export type CompaniesResponse = PaginatedResponse<Company>;
export type JobsResponse = PaginatedResponse<Job>;

export type RejectionRequest = {
  rejectionReason: string;
};

export type ApprovalRequest = {
  // For future use if needed
};
