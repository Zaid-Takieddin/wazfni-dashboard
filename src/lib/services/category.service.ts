import axiosInstance from '../axios';

import type {
  Category,
  Subcategory,
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

export class CategoryService {
  // ===== CATEGORY OPERATIONS =====

  /**
   * Get all categories with pagination
   */
  static async getCategories(filters?: CategoryFilters): Promise<CategoriesResponse> {
    try {
      const params = new URLSearchParams();

      // Pagination
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      // Sorting
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      // Filtering
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = queryString ? `/categories?${queryString}` : '/categories';

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
        console.warn('Unexpected categories response structure:', response.data);
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
      console.error('CategoryService.getCategories error:', error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   */
  static async getCategory(categoryId: string): Promise<Category> {
    try {
      const response = await axiosInstance.get<Category>(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategory error:', error);
      throw error;
    }
  }

  /**
   * Create new category (Admin only)
   */
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await axiosInstance.post<Category>('/categories', data);
      return response.data;
    } catch (error) {
      console.error('CategoryService.createCategory error:', error);
      throw error;
    }
  }

  /**
   * Update category (Admin only)
   */
  static async updateCategory(categoryId: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await axiosInstance.patch<Category>(`/categories/${categoryId}`, data);
      return response.data;
    } catch (error) {
      console.error('CategoryService.updateCategory error:', error);
      throw error;
    }
  }

  /**
   * Delete category (Admin only)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/categories/${categoryId}`);
    } catch (error) {
      console.error('CategoryService.deleteCategory error:', error);
      throw error;
    }
  }

  // ===== SUBCATEGORY OPERATIONS =====

  /**
   * Get subcategories with pagination and filters
   */
  static async getSubcategories(filters?: SubcategoryFilters): Promise<SubcategoriesResponse> {
    try {
      const params = new URLSearchParams();

      // Pagination
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      // Sorting
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      // Filtering
      if (filters?.categoryId) {
        // Use the specific category endpoint for better performance
        const endpoint = `/categories/${filters.categoryId}/subcategories`;
        const response = await axiosInstance.get(endpoint);

        // Handle response structure
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

      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = queryString
        ? `/categories/subcategories?${queryString}`
        : '/categories/subcategories';

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
        console.warn('Unexpected subcategories response structure:', response.data);
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
      console.error('CategoryService.getSubcategories error:', error);
      throw error;
    }
  }

  /**
   * Get subcategories by category ID (backward compatibility)
   */
  static async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    try {
      const response = await this.getSubcategories({ categoryId });
      return response.data;
    } catch (error) {
      console.error('CategoryService.getSubcategoriesByCategory error:', error);
      throw error;
    }
  }

  /**
   * Get single subcategory by ID
   */
  static async getSubcategory(subcategoryId: string): Promise<Subcategory> {
    try {
      const response = await axiosInstance.get<Subcategory>(
        `/categories/subcategories/${subcategoryId}`
      );
      return response.data;
    } catch (error) {
      console.error('CategoryService.getSubcategory error:', error);
      throw error;
    }
  }

  /**
   * Create new subcategory (Admin only)
   */
  static async createSubcategory(
    categoryId: string,
    data: CreateSubcategoryRequest
  ): Promise<Subcategory> {
    try {
      const response = await axiosInstance.post<Subcategory>(
        `/categories/${categoryId}/subcategories`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('CategoryService.createSubcategory error:', error);
      throw error;
    }
  }

  /**
   * Update subcategory (Admin only)
   */
  static async updateSubcategory(
    subcategoryId: string,
    data: UpdateSubcategoryRequest
  ): Promise<Subcategory> {
    try {
      const response = await axiosInstance.patch<Subcategory>(
        `/categories/subcategories/${subcategoryId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('CategoryService.updateSubcategory error:', error);
      throw error;
    }
  }

  /**
   * Delete subcategory (Admin only)
   */
  static async deleteSubcategory(subcategoryId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/categories/subcategories/${subcategoryId}`);
    } catch (error) {
      console.error('CategoryService.deleteSubcategory error:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get all categories with their subcategories (for simple lists)
   */
  static async getCategoriesWithSubcategories(): Promise<Category[]> {
    try {
      // Get categories without pagination for this utility method
      const categoriesResponse = await axiosInstance.get('/categories');

      // Handle different response structures
      let categories: Category[] = [];

      if (Array.isArray(categoriesResponse.data)) {
        categories = categoriesResponse.data;
      } else if (categoriesResponse.data?.data && Array.isArray(categoriesResponse.data.data)) {
        categories = categoriesResponse.data.data;
      } else if (categoriesResponse.data?.success && Array.isArray(categoriesResponse.data?.data)) {
        categories = categoriesResponse.data.data;
      } else {
        console.warn('Unexpected categories response structure:', categoriesResponse.data);
        return [];
      }

      // Ensure categories is an array
      if (!Array.isArray(categories)) {
        console.warn('Categories is not an array:', categories);
        return [];
      }

      // Fetch subcategories for each category
      const categoriesWithSubs = await Promise.all(
        categories.map(async (category: Category) => {
          try {
            const subcategories = await this.getSubcategoriesByCategory(category.id);
            return { ...category, subcategories };
          } catch (error) {
            console.warn(`Failed to fetch subcategories for category ${category.id}:`, error);
            return category;
          }
        })
      );

      return categoriesWithSubs;
    } catch (error) {
      console.error('CategoryService.getCategoriesWithSubcategories error:', error);
      throw error;
    }
  }
}
