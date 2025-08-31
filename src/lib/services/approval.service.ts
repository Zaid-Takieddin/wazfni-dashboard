import type {
  Job,
  Company,
  JobFilters,
  JobsResponse,
  CompanyFilters,
  RejectionRequest,
  CompaniesResponse,
} from 'src/types/approval';

import axiosInstance, { endpoints } from '../axios';

// ----------------------------------------------------------------------

export class ApprovalService {
  // Company Approvals
  static async getCompanies(filters?: CompanyFilters): Promise<CompaniesResponse> {
    const params = new URLSearchParams();

    // Pagination
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Sorting
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    // Filtering
    if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    if (filters?.workField) params.append('workField', filters.workField);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const baseEndpoint =
      filters?.approvalStatus === 'PENDING'
        ? endpoints.admin.approval.companies.pending
        : endpoints.admin.approval.companies.all;
    const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;

    const response = await axiosInstance.get(endpoint);

    // Handle different response structures
    if (response.data?.data && response.data?.pagination) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } else if (Array.isArray(response.data)) {
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
      console.warn('Unexpected companies response structure:', response.data);
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
  }

  static async getPendingCompanies(filters?: CompanyFilters): Promise<CompaniesResponse> {
    return this.getCompanies({ ...filters, approvalStatus: 'PENDING' });
  }

  static async getAllCompanies(filters?: CompanyFilters): Promise<CompaniesResponse> {
    return this.getCompanies(filters);
  }

  static async getCompanyById(companyId: string): Promise<Company> {
    const response = await axiosInstance.get<Company>(
      endpoints.admin.approval.companies.details(companyId)
    );

    return response.data;
  }

  static async approveCompany(companyId: string): Promise<void> {
    await axiosInstance.patch(endpoints.admin.approval.companies.approve(companyId));
  }

  static async rejectCompany(companyId: string, data: RejectionRequest): Promise<void> {
    await axiosInstance.patch(endpoints.admin.approval.companies.reject(companyId), data);
  }

  // Job Approvals
  static async getJobs(filters?: JobFilters): Promise<JobsResponse> {
    const params = new URLSearchParams();

    // Pagination
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Sorting
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    // Filtering
    if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    if (filters?.workType) params.append('workType', filters.workType);
    if (filters?.contractType) params.append('contractType', filters.contractType);
    if (filters?.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
    if (filters?.subCategoryId) params.append('subCategoryId', filters.subCategoryId);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const baseEndpoint =
      filters?.approvalStatus === 'PENDING'
        ? endpoints.admin.approval.jobs.pending
        : endpoints.admin.approval.jobs.all;
    const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;

    const response = await axiosInstance.get(endpoint);

    // Handle different response structures
    if (response.data?.data && response.data?.pagination) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } else if (Array.isArray(response.data)) {
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
      console.warn('Unexpected jobs response structure:', response.data);
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
  }

  static async getPendingJobs(filters?: JobFilters): Promise<JobsResponse> {
    return this.getJobs({ ...filters, approvalStatus: 'PENDING' });
  }

  static async getAllJobs(filters?: JobFilters): Promise<JobsResponse> {
    return this.getJobs(filters);
  }

  static async getJobById(jobId: string): Promise<Job> {
    const response = await axiosInstance.get<Job>(endpoints.admin.approval.jobs.details(jobId));
    return response.data;
  }

  static async approveJob(jobId: string): Promise<void> {
    await axiosInstance.patch(endpoints.admin.approval.jobs.approve(jobId));
  }

  static async rejectJob(jobId: string, data: RejectionRequest): Promise<void> {
    await axiosInstance.patch(endpoints.admin.approval.jobs.reject(jobId), data);
  }
}
