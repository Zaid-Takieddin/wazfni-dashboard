'use client';

import type { UserManagement } from 'src/types/user';

import { useCallback } from 'react';

import {
  Box,
  Chip,
  Grid,
  Card,
  Stack,
  Alert,
  Dialog,
  Button,
  Avatar,
  Typography,
  IconButton,
  DialogTitle,
  CardContent,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useUser } from 'src/lib/hooks/use-users';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onEdit?: (user: UserManagement) => void;
};

export function UserViewDialog({ open, onClose, userId, onEdit }: Props) {
  const { data, isLoading, error } = useUser(userId || '');
  const user = data?.user;
  const profile = data?.profile;

  const handleEdit = useCallback(() => {
    if (user && onEdit) {
      onEdit(user);
    }
  }, [user, onEdit]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      USER: 'primary',
      ADMIN: 'error',
      COMPANY: 'warning',
    } as const;
    return colors[role as keyof typeof colors] || 'default';
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">User Details</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load user details. Please try again.
          </Alert>
        )}

        {user && (
          <Stack spacing={3}>
            {/* User Header */}
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar src={profile?.avatar} sx={{ width: 80, height: 80 }}>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>

                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Typography variant="h5">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        size="small"
                        label={user.role}
                        color={getRoleColor(user.role)}
                        variant="soft"
                      />
                      <Chip
                        size="small"
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        color={user.isVerified ? 'success' : 'warning'}
                        variant="soft"
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body2">{user.phoneNumber || 'Not provided'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">{formatDate(user.updatedAt)}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Profile Information */}
            {profile && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Profile Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Job Title
                        </Typography>
                        <Typography variant="body2">
                          {profile.jobTitle || 'Not provided'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          City
                        </Typography>
                        <Typography variant="body2">{profile.city || 'Not provided'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="body2">{profile.gender || 'Not provided'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Birth Date
                        </Typography>
                        <Typography variant="body2">
                          {profile.birthDate ? formatDate(profile.birthDate) : 'Not provided'}
                        </Typography>
                      </Stack>
                    </Grid>
                    {profile.address && (
                      <Grid item xs={12}>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body2">{profile.address}</Typography>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Company Information */}
            {user.company && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Company Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Company Name
                        </Typography>
                        <Typography variant="body2">{user.company.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Work Field
                        </Typography>
                        <Typography variant="body2">{user.company.workField}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Approval Status
                        </Typography>
                        <Box>
                          <Chip
                            size="small"
                            label={user.company.approvalStatus}
                            color={
                              user.company.approvalStatus === 'APPROVED' ? 'success' : 'warning'
                            }
                            variant="soft"
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Activity Statistics */}
            {user._count && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Activity Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {user._count.applications}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Job Applications
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {user._count.bookmarks}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bookmarked Jobs
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Files */}
            {profile && (profile.cv || profile.avatar) && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Files
                  </Typography>
                  <Stack spacing={2}>
                    {profile.cv && (
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Iconify icon="solar:file-text-bold" width={24} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">CV/Resume</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available for download
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:download-bold" />}
                          onClick={() => window.open(profile.cv, '_blank')}
                        >
                          Download
                        </Button>
                      </Stack>
                    )}
                    {profile.avatar && (
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Iconify icon="solar:camera-bold" width={24} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">Profile Picture</Typography>
                          <Typography variant="caption" color="text.secondary">
                            User&apos;s avatar image
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:eye-bold" />}
                          onClick={() => window.open(profile.avatar, '_blank')}
                        >
                          View
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
        {user && onEdit && (
          <Button
            onClick={handleEdit}
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit User
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
