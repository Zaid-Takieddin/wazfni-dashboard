import type { PaginationParams, PaginatedResponse } from './common';

export type Category = {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: Subcategory[];
};

export type Subcategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
};

export type CategoryFilters = PaginationParams & {
  search?: string;
};

export type SubcategoryFilters = PaginationParams & {
  categoryId?: string;
  search?: string;
};

export type CategoriesResponse = PaginatedResponse<Category>;
export type SubcategoriesResponse = PaginatedResponse<Subcategory>;

export type CreateCategoryRequest = {
  name: string;
  icon?: string;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type CreateSubcategoryRequest = {
  name: string;
};

export type UpdateSubcategoryRequest = Partial<CreateSubcategoryRequest>;

// API Response Types
export type CategoryResponse = {
  data: Category;
  message: string;
  status: number;
};

export type SubcategoryResponse = {
  data: Subcategory;
  message: string;
  status: number;
};

// Form Types
export type CategoryFormData = CreateCategoryRequest;
export type SubcategoryFormData = CreateSubcategoryRequest;
