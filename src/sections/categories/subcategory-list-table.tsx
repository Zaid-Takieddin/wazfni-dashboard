'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { Subcategory } from 'src/types/category';

import { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Chip,
  Stack,
  Select,
  Button,
  Tooltip,
  MenuItem,
  IconButton,
  Typography,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';

import {
  useCategories,
  useDeleteSubcategory,
  useSubcategoriesByCategory,
} from 'src/lib/hooks/use-categories';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomDataGrid from 'src/components/data-grid/custom-datagrid';

import { SubcategoryEditDialog } from './subcategory-edit-dialog';

// ----------------------------------------------------------------------

export function SubcategoryListTable() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState<string | null>(null);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const {
    data: subcategoriesData,
    isLoading,
    error,
  } = useSubcategoriesByCategory(selectedCategoryId);
  const subcategories = subcategoriesData?.subcategories || [];

  const deleteSubcategory = useDeleteSubcategory();

  const handleEdit = useCallback((subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
  }, []);

  const handleDelete = useCallback((subcategoryId: string) => {
    setDeletingSubcategoryId(subcategoryId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingSubcategoryId) return;

    try {
      const subcategory = subcategories.find((s) => s.id === deletingSubcategoryId);
      const subcategoryName = subcategory?.name || 'Subcategory';

      await deleteSubcategory.mutateAsync(deletingSubcategoryId);
      setDeletingSubcategoryId(null);

      toast.success(`${subcategoryName} has been deleted successfully!`);
    } catch (deleteError: any) {
      console.error('Failed to delete subcategory:', deleteError);
      const errorMessage =
        deleteError?.response?.data?.message ||
        deleteError?.message ||
        'Failed to delete subcategory';
      toast.error(`Delete failed: ${errorMessage}`);
    }
  }, [deletingSubcategoryId, deleteSubcategory, subcategories]);

  const handleCancelDelete = useCallback(() => {
    setDeletingSubcategoryId(null);
  }, []);

  const columns: GridColDef<Subcategory>[] = useMemo(
    () => [
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
        field: 'category',
        headerName: 'Category',
        width: 200,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.category?.name || 'N/A'}
            color="secondary"
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
            <Tooltip title="Edit subcategory">
              <IconButton size="small" color="default" onClick={() => handleEdit(params.row)}>
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete subcategory">
              <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const renderCategorySelector = (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel>Select Category</InputLabel>
        <Select
          value={selectedCategoryId}
          label="Select Category"
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderContent = () => {
    if (!selectedCategoryId) {
      return (
        <Box
          sx={{
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Iconify
              icon="solar:folder-open-bold-duotone"
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography color="text.secondary">
              Please select a category to view its subcategories
            </Typography>
          </Box>
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="error">Failed to load subcategories</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ width: '100%' }}>
        <CustomDataGrid data={subcategories} columns={columns} loading={isLoading} />
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        {renderCategorySelector}
        {renderContent()}
      </Box>

      {/* Edit Dialog */}
      {editingSubcategory && (
        <SubcategoryEditDialog
          subcategory={editingSubcategory}
          open={!!editingSubcategory}
          onClose={() => setEditingSubcategory(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingSubcategoryId}
        onClose={handleCancelDelete}
        title="Delete Subcategory"
        content={
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this subcategory? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may affect jobs that are linked to this subcategory.
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={handleCancelDelete}
              disabled={deleteSubcategory.isPending}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={deleteSubcategory.isPending}
              startIcon={
                deleteSubcategory.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                )
              }
              sx={{ flex: 1 }}
            >
              {deleteSubcategory.isPending ? 'Deleting...' : 'Delete Subcategory'}
            </Button>
          </Stack>
        }
      />
    </>
  );
}
