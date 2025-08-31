'use client';

import type { Subcategory, UpdateSubcategoryRequest } from 'src/types/category';

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

import { useUpdateSubcategory } from 'src/lib/hooks/use-categories';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const SubcategorySchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
});

type SubcategoryFormData = zod.infer<typeof SubcategorySchema>;

type Props = {
  subcategory: Subcategory;
  open: boolean;
  onClose: () => void;
};

export function SubcategoryEditDialog({ subcategory, open, onClose }: Props) {
  const updateSubcategory = useUpdateSubcategory();

  const methods = useForm<SubcategoryFormData>({
    resolver: zodResolver(SubcategorySchema),
    defaultValues: {
      name: subcategory.name,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data: SubcategoryFormData) => {
    try {
      const updateData: UpdateSubcategoryRequest = {
        name: data.name,
      };

      await updateSubcategory.mutateAsync({
        subcategoryId: subcategory.id,
        data: updateData,
      });

      toast.success(`Subcategory "${data.name}" has been updated successfully!`);
      reset();
      onClose();
    } catch (updateError: any) {
      console.error('Failed to update subcategory:', updateError);
      const errorMessage =
        updateError?.response?.data?.message ||
        updateError?.message ||
        'Failed to update subcategory';
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
        <DialogTitle>Edit Subcategory</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Field.Text
              name="name"
              label="Subcategory Name"
              placeholder="Enter subcategory name"
              required
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
            disabled={updateSubcategory.isPending}
            startIcon={updateSubcategory.isPending ? <CircularProgress size={20} /> : null}
          >
            Update Subcategory
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
