import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { CategoryService } from '../services/category.service';

import type {
  CategoryFilters,
  SubcategoryFilters,
  CategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  SubcategoriesResponse,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
} from '../../types/category';

// ----------------------------------------------------------------------

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  subcategories: (filters: SubcategoryFilters) =>
    [...categoryKeys.all, 'subcategories', { filters }] as const,
  subcategory: (subcategoryId: string) => ['subcategory', subcategoryId] as const,
  withSubcategories: () => [...categoryKeys.all, 'withSubcategories'] as const,
};

// ===== CATEGORY HOOKS =====

/**
 * Get all categories with pagination
 */
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.list(filters || {}),
    queryFn: () => CategoryService.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: CategoriesResponse) => ({
      categories: data.data,
      pagination: data.pagination,
    }),
  });
}

/**
 * Get single category
 */
export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => CategoryService.getCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all categories with their subcategories (for simple lists)
 */
export function useCategoriesWithSubcategories() {
  return useQuery({
    queryKey: categoryKeys.withSubcategories(),
    queryFn: () => CategoryService.getCategoriesWithSubcategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create category (Admin only)
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => CategoryService.createCategory(data),
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      // Optionally add the new category to cache
      queryClient.setQueryData(categoryKeys.detail(newCategory.id), newCategory);

      console.log('Category created successfully:', newCategory);
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
    },
  });
}

/**
 * Update category (Admin only)
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryRequest }) =>
      CategoryService.updateCategory(categoryId, data),
    onSuccess: (updatedCategory, { categoryId }) => {
      // Update the specific category in cache
      queryClient.setQueryData(categoryKeys.detail(categoryId), updatedCategory);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      console.log('Category updated successfully:', updatedCategory);
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
    },
  });
}

/**
 * Delete category (Admin only)
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => CategoryService.deleteCategory(categoryId),
    onSuccess: (_, categoryId) => {
      // Remove the category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(categoryId) });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      console.log('Category deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
    },
  });
}

// ===== SUBCATEGORY HOOKS =====

/**
 * Get subcategories with pagination and filters
 */
export function useSubcategories(filters?: SubcategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.subcategories(filters || {}),
    queryFn: () => CategoryService.getSubcategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: SubcategoriesResponse) => ({
      subcategories: data.data,
      pagination: data.pagination,
    }),
  });
}

/**
 * Get subcategories by category (backward compatibility)
 */
export function useSubcategoriesByCategory(categoryId: string) {
  return useSubcategories({ categoryId });
}

/**
 * Get single subcategory
 */
export function useSubcategory(subcategoryId: string) {
  return useQuery({
    queryKey: categoryKeys.subcategory(subcategoryId),
    queryFn: () => CategoryService.getSubcategory(subcategoryId),
    enabled: !!subcategoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create subcategory (Admin only)
 */
export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CreateSubcategoryRequest }) =>
      CategoryService.createSubcategory(categoryId, data),
    onSuccess: (newSubcategory, { categoryId }) => {
      // Invalidate subcategories list for the parent category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.subcategories({ categoryId }),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      // Add the new subcategory to cache
      queryClient.setQueryData(categoryKeys.subcategory(newSubcategory.id), newSubcategory);

      console.log('Subcategory created successfully:', newSubcategory);
    },
    onError: (error) => {
      console.error('Failed to create subcategory:', error);
    },
  });
}

/**
 * Update subcategory (Admin only)
 */
export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subcategoryId,
      data,
    }: {
      subcategoryId: string;
      data: UpdateSubcategoryRequest;
    }) => CategoryService.updateSubcategory(subcategoryId, data),
    onSuccess: (updatedSubcategory, { subcategoryId }) => {
      // Update the specific subcategory in cache
      queryClient.setQueryData(categoryKeys.subcategory(subcategoryId), updatedSubcategory);

      // Invalidate subcategories lists
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'categories' && query.queryKey[1] === 'subcategories',
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      console.log('Subcategory updated successfully:', updatedSubcategory);
    },
    onError: (error) => {
      console.error('Failed to update subcategory:', error);
    },
  });
}

/**
 * Delete subcategory (Admin only)
 */
export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subcategoryId: string) => CategoryService.deleteSubcategory(subcategoryId),
    onSuccess: (_, subcategoryId) => {
      // Remove the subcategory from cache
      queryClient.removeQueries({ queryKey: categoryKeys.subcategory(subcategoryId) });

      // Invalidate subcategories lists
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'categories' && query.queryKey[1] === 'subcategories',
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.withSubcategories() });

      console.log('Subcategory deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete subcategory:', error);
    },
  });
}
