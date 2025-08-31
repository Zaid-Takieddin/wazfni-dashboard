'use client';

import type { Category, UpdateCategoryRequest } from 'src/types/category';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useUpdateCategory } from 'src/lib/hooks/use-categories';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const CategorySchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  icon: zod.string().optional(),
});

type CategoryFormData = zod.infer<typeof CategorySchema>;

type Props = {
  category: Category;
  open: boolean;
  onClose: () => void;
};

export function CategoryEditDialog({ category, open, onClose }: Props) {
  const updateCategory = useUpdateCategory();

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category.name,
      icon: category.icon || '',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data: CategoryFormData) => {
    try {
      const updateData: UpdateCategoryRequest = {
        name: data.name,
        ...(data.icon && { icon: data.icon }),
      };

      await updateCategory.mutateAsync({
        categoryId: category.id,
        data: updateData,
      });

      toast.success(`Category "${data.name}" has been updated successfully!`);
      reset();
      onClose();
    } catch (updateError: any) {
      console.error('Failed to update category:', updateError);
      const errorMessage =
        updateError?.response?.data?.message || updateError?.message || 'Failed to update category';
      toast.error(`Update failed: ${errorMessage}`);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Edit Category</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Field.Text
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required
            />

            <Field.Text
              name="icon"
              label="Icon (optional)"
              placeholder="e.g., solar:folder-bold"
              helperText="Use Iconify icon names"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={updateCategory.isPending}
            startIcon={updateCategory.isPending ? <CircularProgress size={20} /> : null}
          >
            Update Category
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
