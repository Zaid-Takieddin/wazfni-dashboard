'use client';

import { useState, useCallback } from 'react';

import { Box, Card, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { UserService } from 'src/lib/services/user.service';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { UserListTable } from '../user-list-table';
import { UserCreateDialog } from '../user-create-dialog';
import { UserFiltersDrawer } from '../user-filters-drawer';

// ----------------------------------------------------------------------

export function UserManagementView() {
  const { user } = useAuthContext();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});

  // Check permissions
  const permissions = UserService.getUserPermissions(user?.role);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleExport = useCallback(() => {
    // This will be handled by the export hook in the table component
    console.log('Export users with filters:', filters);
  }, [filters]);

  // Role-based access control
  if (!permissions.canViewUsers) {
    return (
      <DashboardContent>
        <Box
          sx={{
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box>
            <Iconify
              icon="solar:shield-cross-bold-duotone"
              width={64}
              sx={{ color: 'error.main', mb: 2 }}
            />
            <Typography variant="h6" color="error">
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don&apos;t have permission to view user management
            </Typography>
          </Box>
        </Box>
      </DashboardContent>
    );
  }

  const renderActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:filter-bold" />}
        onClick={() => setFiltersOpen(true)}
      >
        Filters
      </Button>

      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:export-bold" />}
        onClick={handleExport}
      >
        Export
      </Button>

      {permissions.canCreateUsers && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add User
        </Button>
      )}
    </Box>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="User Management"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Users' }]}
        action={renderActions}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <UserListTable
          filters={filters}
          onFiltersChange={handleFiltersChange}
          permissions={permissions}
        />
      </Card>

      {/* Dialogs */}
      {permissions.canCreateUsers && (
        <UserCreateDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      )}

      <UserFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </DashboardContent>
  );
}
