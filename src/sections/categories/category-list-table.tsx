'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { Category, CategoryFilters } from 'src/types/category';

import { useState, useCallback } from 'react';

import {
  Box,
  Chip,
  Stack,
  Button,
  Tooltip,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useCategories, useDeleteCategory } from 'src/lib/hooks/use-categories';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomDataGrid from 'src/components/data-grid/custom-datagrid';

import { DEFAULT_PAGE, DEFAULT_LIMIT } from 'src/types/common';

import { CategoryEditDialog } from './category-edit-dialog';

// ----------------------------------------------------------------------

export function CategoryListTable() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { data, isLoading, error } = useCategories(filters);
  const categories = data?.categories || [];
  const pagination = data?.pagination;

  const deleteCategory = useDeleteCategory();

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
  }, []);

  const handleDelete = useCallback((categoryId: string) => {
    setDeletingCategoryId(categoryId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingCategoryId) return;

    try {
      const category = categories.find((c) => c.id === deletingCategoryId);
      const categoryName = category?.name || 'Category';

      await deleteCategory.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);

      toast.success(`${categoryName} has been deleted successfully!`);
    } catch (deleteError: any) {
      console.error('Failed to delete category:', deleteError);
      const errorMessage =
        deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete category';
      toast.error(`Delete failed: ${errorMessage}`);
    }
  }, [deletingCategoryId, deleteCategory, categories]);

  const handleCancelDelete = useCallback(() => {
    setDeletingCategoryId(null);
  }, []);

  const columns: GridColDef<Category>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'icon',
      headerName: 'Icon',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <Iconify icon={params.value} width={24} height={24} />
        ) : (
          <Typography variant="body2" color="text.disabled">
            -
          </Typography>
        ),
    },
    {
      field: 'subcategories',
      headerName: 'Subcategories',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          size="small"
          label={`${params.row.subcategories?.length || 0} items`}
          color="primary"
          variant="soft"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit category">
            <IconButton size="small" color="default" onClick={() => handleEdit(params.row)}>
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete category">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography color="error">Failed to load categories</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <CustomDataGrid
          data={categories}
          columns={columns}
          loading={isLoading}
          serverSide
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSortChange={handleSortChange}
        />
      </Box>

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryEditDialog
          category={editingCategory}
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingCategoryId}
        onClose={handleCancelDelete}
        title="Delete Category"
        content={
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this category? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will also delete all associated subcategories and may affect jobs linked to this
              category.
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={handleCancelDelete}
              disabled={deleteCategory.isPending}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={deleteCategory.isPending}
              startIcon={
                deleteCategory.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                )
              }
              sx={{ flex: 1 }}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete Category'}
            </Button>
          </Stack>
        }
      />
    </>
  );
}
