'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { Company, CompanyFilters } from 'src/types/approval';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useRejectCompany,
  useApproveCompany,
  usePendingCompanies,
} from 'src/lib/hooks/use-approval';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDataGrid from 'src/components/data-grid/custom-datagrid';

import { DEFAULT_PAGE, DEFAULT_LIMIT } from 'src/types/common';

// ----------------------------------------------------------------------

export default function PendingCompaniesPage() {
  const router = useRouter();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filters, setFilters] = useState<CompanyFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    approvalStatus: 'PENDING',
  });

  const { data, isLoading, error } = usePendingCompanies(filters);
  const companies = data?.companies || [];
  const pagination = data?.pagination;

  const approveCompanyMutation = useApproveCompany();
  const rejectCompanyMutation = useRejectCompany();

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
  }, []);

  const handleApprove = async (company: Company) => {
    setSelectedCompany(company);
    setApproveConfirmOpen(true);
  };

  const handleReject = async (company: Company) => {
    setSelectedCompany(company);
    setRejectDialogOpen(true);
  };

  const handleView = (company: Company) => {
    router.push(paths.dashboard.approvals.companies.details(company.id));
  };

  const confirmApprove = async () => {
    if (!selectedCompany) return;

    try {
      await approveCompanyMutation.mutateAsync(selectedCompany.id);

      toast.success(
        `${selectedCompany.name} has been approved successfully! They can now post jobs.`
      );
      setApproveConfirmOpen(false);
      setSelectedCompany(null);
    } catch (approveError: any) {
      console.error('Failed to approve company:', approveError);
      const errorMessage =
        approveError?.response?.data?.message ||
        approveError?.message ||
        'Failed to approve company';
      toast.error(`Approval failed: ${errorMessage}`);
    }
  };

  const confirmReject = async () => {
    if (!selectedCompany || !rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }

    try {
      await rejectCompanyMutation.mutateAsync({
        companyId: selectedCompany.id,
        data: { rejectionReason },
      });

      toast.success(
        `${selectedCompany.name} has been rejected. They have been notified with the reason.`
      );
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedCompany(null);
    } catch (rejectError: any) {
      console.error('Failed to reject company:', rejectError);
      const errorMessage =
        rejectError?.response?.data?.message || rejectError?.message || 'Failed to reject company';
      toast.error(`Rejection failed: ${errorMessage}`);
    }
  };

  const columns: GridColDef<Company>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Company',
        flex: 2,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
            <Avatar
              src={params.row.logo}
              alt={params.row.name}
              variant="rounded"
              sx={{ width: 32, height: 32, flexShrink: 0 }}
            >
              {params.row.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {params.row.name}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'workField',
        headerName: 'Work Field',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'location',
        headerName: 'Location',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'size',
        headerName: 'Size',
        width: 100,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'approvalStatus',
        headerName: 'Status',
        width: 100,
        renderCell: (params) => (
          <Label variant="soft" color="warning" sx={{ textTransform: 'capitalize' }}>
            {params.value}
          </Label>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Submitted',
        width: 110,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Iconify icon="solar:eye-bold" />}
            label="View"
            onClick={() => handleView(params.row)}
          />,
          <GridActionsCellItem
            icon={<Iconify icon="eva:checkmark-fill" />}
            label="Approve"
            onClick={() => handleApprove(params.row)}
            disabled={
              approveCompanyMutation.isPending &&
              selectedCompany?.id === params.row.id &&
              params.row.approvalStatus === 'PENDING'
            }
          />,
          <GridActionsCellItem
            icon={<Iconify icon="eva:close-fill" />}
            label="Reject"
            onClick={() => handleReject(params.row)}
            disabled={
              rejectCompanyMutation.isPending &&
              selectedCompany?.id === params.row.id &&
              params.row.approvalStatus === 'PENDING'
            }
          />,
        ],
      },
    ],
    [
      approveCompanyMutation.isPending,
      rejectCompanyMutation.isPending,
      selectedCompany?.id,
      handleView,
      handleApprove,
      handleReject,
    ]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Pending Company Approvals"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Approvals', href: paths.dashboard.approvals.root },
            { name: 'Companies' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <EmptyContent title="Error" description="Failed to load companies" />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Pending Company Approvals"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Approvals', href: paths.dashboard.approvals.root },
          { name: 'Companies' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <CustomDataGrid
            data={companies}
            columns={columns}
            loading={isLoading}
            serverSide
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleSortChange}
          />
        </Box>
      </Card>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        title="Approve Company"
        content={
          selectedCompany && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to approve <strong>{selectedCompany.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once approved, this company will be able to post job listings and manage their
                company profile.
              </Typography>
            </Box>
          )
        }
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={confirmApprove}
            loading={approveCompanyMutation.isPending}
            startIcon={<Iconify icon="eva:checkmark-fill" />}
          >
            Approve Company
          </LoadingButton>
        }
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:close-fill" sx={{ color: 'error.main' }} />
            Reject Company
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedCompany && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                You are about to reject <strong>{selectedCompany.name}</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please provide a clear reason for rejection. This will be sent to the company.
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a detailed reason for rejection..."
            required
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="error"
            onClick={confirmReject}
            loading={rejectCompanyMutation.isPending}
            disabled={!rejectionReason.trim()}
            startIcon={<Iconify icon="eva:close-fill" />}
          >
            Reject Company
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
