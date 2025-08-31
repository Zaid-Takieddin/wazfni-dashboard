'use client';

import type { UserManagement, UpdateUserRequest } from 'src/types/user';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Grid,
  Stack,
  Alert,
  Dialog,
  Button,
  Select,
  Switch,
  MenuItem,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useUpdateUser } from 'src/lib/hooks/use-users';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  phoneNumber: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'COMPANY'], {
    errorMap: () => ({ message: 'Role is required' }),
  }),
  isActive: z.boolean(),
  password: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  user: UserManagement | null;
};

export function UserEditDialog({ open, onClose, user }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const updateUser = useUpdateUser();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'USER',
      isActive: true,
      password: '',
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        isActive: user.isVerified,
        password: '',
      });
    }
  }, [user, reset]);

  const handleClose = useCallback(() => {
    reset();
    setShowPassword(false);
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return;

      try {
        const updateData: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber || undefined,
          role: data.role,
          isActive: data.isActive,
        };

        // Only include password if it's provided
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }

        await updateUser.mutateAsync({
          userId: user.id,
          data: updateData,
        });

        toast.success(`User ${data.firstName} ${data.lastName} updated successfully!`);
        handleClose();
      } catch (error: any) {
        console.error('Failed to update user:', error);
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to update user';
        toast.error(`Update failed: ${errorMessage}`);
      }
    },
    [user, updateUser, handleClose]
  );

  if (!open || !user) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Edit User</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={3}>
            {/* User Info Header */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Editing user:{' '}
              <strong>
                {user.firstName} {user.lastName}
              </strong>{' '}
              ({user.email})
            </Alert>

            {/* Basic Information */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="firstName" label="First Name" placeholder="Enter first name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="lastName" label="Last Name" placeholder="Enter last name" />
              </Grid>
            </Grid>

            <RHFTextField
              name="email"
              label="Email Address"
              placeholder="Enter email address"
              type="email"
            />

            <RHFTextField
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter phone number (optional)"
            />

            {/* Role Selection */}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={watch('role')}
                onChange={(e) => methods.setValue('role', e.target.value as FormData['role'])}
                label="Role"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="COMPANY">Company</MenuItem>
              </Select>
            </FormControl>

            {/* Status Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={watch('isActive')}
                  onChange={(e) => methods.setValue('isActive', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    {watch('isActive') ? 'Verified User' : 'Unverified User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {watch('isActive')
                      ? 'User has verified email and can access all features'
                      : 'User needs to verify email or admin approval'}
                  </Typography>
                </Box>
              }
            />

            {/* Password Section */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" color="warning.main">
                      Change Password
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Leave empty to keep current password
                    </Typography>
                  </Box>
                }
              />

              {showPassword && (
                <Box sx={{ mt: 2 }}>
                  <RHFTextField
                    name="password"
                    label="New Password"
                    placeholder="Enter new password"
                    type="password"
                    helperText="Minimum 6 characters recommended"
                  />
                </Box>
              )}
            </Box>

            {/* Error Display */}
            {updateUser.isError && (
              <Alert severity="error">
                Failed to update user. Please check your inputs and try again.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? undefined : <Iconify icon="solar:diskette-bold" />}
          >
            {isSubmitting ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
