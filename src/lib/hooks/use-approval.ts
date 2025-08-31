import type {
  JobFilters,
  JobsResponse,
  CompanyFilters,
  RejectionRequest,
  CompaniesResponse,
} from 'src/types/approval';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ApprovalService } from '../services/approval.service';

// ----------------------------------------------------------------------

// Query Keys
export const approvalKeys = {
  all: ['approvals'] as const,
  companies: {
    all: ['approvals', 'companies'] as const,
    list: (filters: CompanyFilters) => ['approvals', 'companies', 'list', { filters }] as const,
    pending: (filters?: CompanyFilters) =>
      ['approvals', 'companies', 'pending', { filters }] as const,
    details: (id: string) => ['approvals', 'companies', 'details', id] as const,
  },
  jobs: {
    all: ['approvals', 'jobs'] as const,
    list: (filters: JobFilters) => ['approvals', 'jobs', 'list', { filters }] as const,
    pending: (filters?: JobFilters) => ['approvals', 'jobs', 'pending', { filters }] as const,
    details: (id: string) => ['approvals', 'jobs', 'details', id] as const,
  },
} as const;

// ----------------------------------------------------------------------

// Company Hooks
export function usePendingCompanies(filters?: CompanyFilters) {
  const pendingFilters = { ...filters, approvalStatus: 'PENDING' as const };

  return useQuery({
    queryKey: approvalKeys.companies.pending(filters),
    queryFn: () => ApprovalService.getCompanies(pendingFilters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: CompaniesResponse) => ({
      companies: data.data,
      pagination: data.pagination,
    }),
  });
}

export function useAllCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: approvalKeys.companies.list(filters || {}),
    queryFn: () => ApprovalService.getCompanies(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: CompaniesResponse) => ({
      companies: data.data,
      pagination: data.pagination,
    }),
  });
}

export function useCompanyDetails(companyId: string) {
  return useQuery({
    queryKey: approvalKeys.companies.details(companyId),
    queryFn: () => ApprovalService.getCompanyById(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useApproveCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => ApprovalService.approveCompany(companyId),
    onSuccess: () => {
      // Invalidate and refetch approval queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.companies.all });
    },
    onError: (error) => {
      console.error('Failed to approve company:', error);
    },
  });
}

export function useRejectCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: RejectionRequest }) =>
      ApprovalService.rejectCompany(companyId, data),
    onSuccess: () => {
      // Invalidate and refetch approval queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.companies.all });
    },
    onError: (error) => {
      console.error('Failed to reject company:', error);
    },
  });
}

// Job Hooks
export function usePendingJobs(filters?: JobFilters) {
  const pendingFilters = { ...filters, approvalStatus: 'PENDING' as const };

  return useQuery({
    queryKey: approvalKeys.jobs.pending(filters),
    queryFn: () => ApprovalService.getJobs(pendingFilters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: JobsResponse) => ({
      jobs: data.data,
      pagination: data.pagination,
    }),
  });
}

export function useAllJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: approvalKeys.jobs.list(filters || {}),
    queryFn: () => ApprovalService.getJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: JobsResponse) => ({
      jobs: data.data,
      pagination: data.pagination,
    }),
  });
}

export function useJobDetails(jobId: string) {
  return useQuery({
    queryKey: approvalKeys.jobs.details(jobId),
    queryFn: () => ApprovalService.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => ApprovalService.approveJob(jobId),
    onSuccess: () => {
      // Invalidate and refetch approval queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.jobs.all });
    },
    onError: (error) => {
      console.error('Failed to approve job:', error);
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: RejectionRequest }) =>
      ApprovalService.rejectJob(jobId, data),
    onSuccess: () => {
      // Invalidate and refetch approval queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.jobs.all });
    },
    onError: (error) => {
      console.error('Failed to reject job:', error);
    },
  });
}
