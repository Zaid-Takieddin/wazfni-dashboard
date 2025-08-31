'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { UserFilters, UserManagement, UserPermissions } from 'src/types/user';

import { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Chip,
  Menu,
  Link,
  Stack,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import {
  useUsers,
  useDeleteUser,
  useExportUsers,
  useUpdateUserRole,
  useToggleUserStatus,
} from 'src/lib/hooks/use-users';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomDataGrid from 'src/components/data-grid/custom-datagrid';

import { DEFAULT_PAGE, DEFAULT_LIMIT } from 'src/types/common';

import { UserViewDialog } from './user-view-dialog';
import { UserEditDialog } from './user-edit-dialog';

// ----------------------------------------------------------------------

type Props = {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  permissions: UserPermissions;
};

export function UserListTable({ filters, onFiltersChange, permissions }: Props) {
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<{
    anchorEl: HTMLElement;
    userId: string;
  } | null>(null);

  // Ensure filters have default pagination values
  const paginatedFilters = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    ...filters,
  };

  const { data, isLoading, error } = useUsers(paginatedFilters);
  const users = data?.users || [];
  const pagination = data?.pagination;

  const deleteUser = useDeleteUser();
  const toggleUserStatus = useToggleUserStatus();
  const updateUserRole = useUpdateUserRole();
  const exportUsers = useExportUsers();

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      onFiltersChange({
        ...filters,
        page,
        limit: pageSize,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      onFiltersChange({
        ...filters,
        sortBy,
        sortOrder,
      });
    },
    [filters, onFiltersChange]
  );

  const handleView = useCallback((user: UserManagement) => {
    setViewingUserId(user.id);
  }, []);

  const handleEdit = useCallback((user: UserManagement) => {
    setEditingUser(user);
  }, []);

  const handleDelete = useCallback((userId: string) => {
    setDeletingUserId(userId);
  }, []);

  const handleToggleStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      try {
        const user = users.find((u) => u.id === userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

        await toggleUserStatus.mutateAsync({ userId, isActive });

        toast.success(`${userName} has been ${isActive ? 'verified' : 'unverified'} successfully!`);
      } catch (toggleError: any) {
        console.error('Failed to toggle user status:', toggleError);
        const errorMessage =
          toggleError?.response?.data?.message ||
          toggleError?.message ||
          'Failed to update user status';
        toast.error(`Status update failed: ${errorMessage}`);
      }
    },
    [toggleUserStatus, users]
  );

  const handleRoleChange = useCallback(
    async (userId: string, role: string) => {
      try {
        const user = users.find((u) => u.id === userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

        await updateUserRole.mutateAsync({ userId, role });
        setRoleMenuAnchor(null);

        toast.success(`${userName}'s role has been changed to ${role} successfully!`);
      } catch (roleError: any) {
        console.error('Failed to update user role:', roleError);
        const errorMessage =
          roleError?.response?.data?.message || roleError?.message || 'Failed to update user role';
        toast.error(`Role update failed: ${errorMessage}`);
        setRoleMenuAnchor(null);
      }
    },
    [updateUserRole, users]
  );

  const handleExport = useCallback(async () => {
    try {
      await exportUsers.mutateAsync(filters);
      toast.success('User data exported successfully!');
    } catch (exportError: any) {
      console.error('Failed to export users:', exportError);
      const errorMessage =
        exportError?.response?.data?.message || exportError?.message || 'Failed to export users';
      toast.error(`Export failed: ${errorMessage}`);
    }
  }, [exportUsers, filters]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingUserId) return;

    try {
      const user = users.find((u) => u.id === deletingUserId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

      await deleteUser.mutateAsync(deletingUserId);
      setDeletingUserId(null);

      toast.success(`${userName} has been deleted successfully!`);
    } catch (deleteError: any) {
      console.error('Failed to delete user:', deleteError);
      const errorMessage =
        deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete user';
      toast.error(`Delete failed: ${errorMessage}`);
    }
  }, [deletingUserId, deleteUser, users]);

  const handleCancelDelete = useCallback(() => {
    setDeletingUserId(null);
  }, []);

  const handleCompanyClick = useCallback((companyId: string) => {
    // TODO: Navigate to company details page
    console.log('Navigate to company:', companyId);
    toast.info('Company details page coming soon!');
    // router.push(`/dashboard/companies/${companyId}`);
  }, []);

  // Close view dialog and open edit dialog
  const handleViewToEdit = useCallback((user: UserManagement) => {
    setViewingUserId(null);
    setEditingUser(user);
  }, []);

  const columns: GridColDef<UserManagement>[] = useMemo(
    () => [
      {
        field: 'avatar',
        headerName: '',
        width: 60,
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Avatar src={params.row.profile?.avatar} sx={{ width: 32, height: 32 }}>
            {params.row.firstName[0]}
            {params.row.lastName[0]}
          </Avatar>
        ),
      },
      {
        field: 'fullName',
        headerName: 'Name',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={
              params.value === 'ADMIN' ? 'primary' : params.value === 'COMPANY' ? 'info' : 'default'
            }
            variant="soft"
            onClick={
              permissions.canManageRoles
                ? (event) =>
                    setRoleMenuAnchor({ anchorEl: event.currentTarget, userId: params.row.id })
                : undefined
            }
            sx={{ cursor: permissions.canManageRoles ? 'pointer' : 'default' }}
          />
        ),
      },
      {
        field: 'isVerified',
        headerName: 'Status',
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.value ? 'Verified' : 'Unverified'}
            size="small"
            color={params.value ? 'success' : 'warning'}
            variant="soft"
          />
        ),
      },
      {
        field: 'company',
        headerName: 'Company',
        width: 180,
        renderCell: (params) => {
          const { company } = params.row;
          if (!company) {
            return (
              <Typography variant="body2" color="text.disabled">
                No company
              </Typography>
            );
          }

          return (
            <Stack spacing={0.5}>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleCompanyClick(company.id)}
                sx={{
                  textAlign: 'left',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {company.name}
              </Link>
              <Chip
                label={company.approvalStatus}
                size="small"
                color={company.approvalStatus === 'APPROVED' ? 'success' : 'warning'}
                variant="soft"
                sx={{ fontSize: '0.7rem', height: 20, alignSelf: 'flex-start' }}
              />
            </Stack>
          );
        },
      },
      {
        field: 'lastLogin',
        headerName: 'Last Login',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value ? new Date(params.value).toLocaleDateString() : 'Never'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View details">
              <IconButton size="small" onClick={() => handleView(params.row)}>
                <Iconify icon="solar:eye-bold" width={18} />
              </IconButton>
            </Tooltip>

            {permissions.canUpdateUsers && (
              <Tooltip title="Edit user">
                <IconButton size="small" onClick={() => handleEdit(params.row)}>
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
              </Tooltip>
            )}

            {permissions.canDeactivateUsers && (
              <Tooltip title={params.row.isVerified ? 'Unverify' : 'Verify'}>
                <IconButton
                  size="small"
                  color={params.row.isVerified ? 'warning' : 'success'}
                  onClick={() => handleToggleStatus(params.row.id, !params.row.isVerified)}
                >
                  <Iconify
                    icon={params.row.isVerified ? 'solar:user-cross-bold' : 'solar:user-check-bold'}
                    width={18}
                  />
                </IconButton>
              </Tooltip>
            )}

            {permissions.canDeleteUsers && (
              <Tooltip title="Delete user">
                <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [permissions, handleView, handleEdit, handleDelete, handleToggleStatus, handleCompanyClick]
  );

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography color="error">Failed to load users</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <CustomDataGrid
          data={users}
          columns={columns}
          loading={isLoading}
          serverSide
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSortChange={handleSortChange}
        />
      </Box>

      {/* Role Change Menu */}
      <Menu
        anchorEl={roleMenuAnchor?.anchorEl}
        open={!!roleMenuAnchor}
        onClose={() => setRoleMenuAnchor(null)}
      >
        {['USER', 'ADMIN', 'COMPANY'].map((role) => (
          <MenuItem
            key={role}
            onClick={() => roleMenuAnchor && handleRoleChange(roleMenuAnchor.userId, role)}
          >
            {role}
          </MenuItem>
        ))}
      </Menu>

      {/* User View Dialog */}
      <UserViewDialog
        open={!!viewingUserId}
        onClose={() => setViewingUserId(null)}
        userId={viewingUserId}
        onEdit={permissions.canUpdateUsers ? handleViewToEdit : undefined}
      />

      {/* User Edit Dialog */}
      <UserEditDialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingUserId}
        onClose={handleCancelDelete}
        title="Delete User"
        content={
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will permanently delete all user data including:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Profile information and uploaded files
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Company data and associations
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Application history and bookmarks
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                All activity and behavioral data
              </Typography>
            </Box>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={handleCancelDelete}
              disabled={deleteUser.isPending}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={deleteUser.isPending}
              startIcon={
                deleteUser.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                )
              }
              sx={{ flex: 1 }}
            >
              {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </Stack>
        }
      />
    </>
  );
}
