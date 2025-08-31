'use client';

import type { CreateCategoryRequest } from 'src/types/category';

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

import { useCreateCategory } from 'src/lib/hooks/use-categories';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const CategorySchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  icon: zod.string().optional(),
});

type CategoryFormData = zod.infer<typeof CategorySchema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CategoryCreateDialog({ open, onClose }: Props) {
  const createCategory = useCreateCategory();

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data: CategoryFormData) => {
    try {
      const createData: CreateCategoryRequest = {
        name: data.name,
        ...(data.icon && { icon: data.icon }),
      };

      await createCategory.mutateAsync(createData);

      toast.success(`Category "${data.name}" has been created successfully!`);
      reset();
      onClose();
    } catch (createError: any) {
      console.error('Failed to create category:', createError);
      const errorMessage =
        createError?.response?.data?.message || createError?.message || 'Failed to create category';
      toast.error(`Creation failed: ${errorMessage}`);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Create New Category</DialogTitle>

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
            disabled={createCategory.isPending}
            startIcon={createCategory.isPending ? <CircularProgress size={20} /> : null}
          >
            Create Category
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
