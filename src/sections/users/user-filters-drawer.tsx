'use client';

import type { UserFilters } from 'src/types/user';

import { useState, useCallback } from 'react';

import {
  Box,
  Stack,
  Drawer,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
};

export function UserFiltersDrawer({ open, onClose, filters, onFiltersChange }: Props) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters);

  const handleFilterChange = useCallback((key: keyof UserFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters);
    onClose();
  }, [localFilters, onFiltersChange, onClose]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: UserFilters = {
      role: undefined,
      isVerified: undefined,
      search: '',
      page: 1,
      limit: 10,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const handleClose = useCallback(() => {
    // Reset to original filters when canceling
    setLocalFilters(filters);
    onClose();
  }, [filters, onClose]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: 320, p: 3 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>
        <IconButton onClick={handleClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Search */}
        <TextField
          label="Search"
          placeholder="Search by name or email..."
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />
            ),
          }}
        />

        {/* Role Filter */}
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={localFilters.role || 'ALL'}
            onChange={(e) =>
              handleFilterChange('role', e.target.value === 'ALL' ? undefined : e.target.value)
            }
            label="Role"
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="COMPANY">Company</MenuItem>
          </Select>
        </FormControl>

        {/* Verification Status Filter */}
        <FormControl fullWidth>
          <InputLabel>Verification Status</InputLabel>
          <Select
            value={localFilters.isVerified !== undefined ? String(localFilters.isVerified) : 'ALL'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('isVerified', value === 'ALL' ? undefined : value === 'true');
            }}
            label="Verification Status"
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Unverified</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Sorting Options */}
        <Typography variant="subtitle2" color="text.primary">
          Sorting
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={localFilters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            label="Sort By"
          >
            <MenuItem value="createdAt">Created Date</MenuItem>
            <MenuItem value="updatedAt">Updated Date</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="role">Role</MenuItem>
            <MenuItem value="isVerified">Verification Status</MenuItem>
            <MenuItem value="lastLogin">Last Login</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            label="Sort Order"
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Pagination */}
        <Typography variant="subtitle2" color="text.primary">
          Pagination
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Items per Page</InputLabel>
          <Select
            value={localFilters.limit || 10}
            onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
            label="Items per Page"
          >
            <MenuItem value={10}>10 items</MenuItem>
            <MenuItem value={20}>20 items</MenuItem>
            <MenuItem value={50}>50 items</MenuItem>
            <MenuItem value={100}>100 items</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Actions */}
      <Box sx={{ mt: 'auto', pt: 3 }}>
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            startIcon={<Iconify icon="eva:checkmark-fill" />}
            fullWidth
          >
            Apply Filters
          </Button>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<Iconify icon="eva:refresh-fill" />}
            fullWidth
          >
            Clear All
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
