import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

export type IPaymentCard = {
  id: string;
  cardType: string;
  primary?: boolean;
  cardNumber: string;
};

export type IAddressItem = {
  id?: string;
  name: string;
  company?: string;
  primary?: boolean;
  fullAddress: string;
  phoneNumber?: string;
  addressType?: string;
};

export type IDateValue = string | number | null;

export type IDatePickerControl = Dayjs | null;

export type ISocialLink = {
  twitter: string;
  facebook: string;
  linkedin: string;
  instagram: string;
};

// ----------------------------------------------------------------------
// Common Types
// ----------------------------------------------------------------------

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams = {
  search?: string;
  [key: string]: any;
};

export type TableFilters = PaginationParams & FilterParams;

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_ORDER = 'desc';
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Utility functions
export function createPaginationParams(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = DEFAULT_SORT_ORDER
): PaginationParams {
  return {
    page,
    limit,
    ...(sortBy && { sortBy }),
    sortOrder,
  };
}

export function getSkipCount(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function getPageInfo(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = getTotalPages(total, limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
