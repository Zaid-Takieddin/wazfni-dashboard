'use client';

import type { CreateUserRequest } from 'src/types/user';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Stack,
  Alert,
  Dialog,
  Button,
  MenuItem,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useCreateUser } from 'src/lib/hooks/use-users';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const UserSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email format'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  firstName: zod.string().min(1, 'First name is required'),
  lastName: zod.string().min(1, 'Last name is required'),
  phoneNumber: zod.string().optional(),
  role: zod.enum(['USER', 'ADMIN', 'COMPANY']).optional(),
});

type UserFormData = zod.infer<typeof UserSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UserCreateDialog({ open, onClose }: Props) {
  const createUser = useCreateUser();

  const methods = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'USER',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createUser.mutateAsync(data as CreateUserRequest);
      toast.success(`User ${data.firstName} ${data.lastName} created successfully!`);
      onClose();
      reset();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create user';
      toast.error(`Creation failed: ${errorMessage}`);
    }
  });

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Create New User</Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new user to the system
        </Typography>
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {createUser.error && (
              <Alert severity="error">
                {createUser.error instanceof Error
                  ? createUser.error.message
                  : 'Failed to create user'}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField name="firstName" label="First Name" fullWidth />
              <RHFTextField name="lastName" label="Last Name" fullWidth />
            </Stack>

            <RHFTextField name="email" label="Email Address" type="email" fullWidth />

            <RHFTextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              helperText="Minimum 6 characters"
            />

            <RHFTextField
              name="phoneNumber"
              label="Phone Number"
              fullWidth
              placeholder="+1234567890"
            />

            <RHFSelect name="role" label="Role" fullWidth>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="COMPANY">Company</MenuItem>
            </RHFSelect>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
