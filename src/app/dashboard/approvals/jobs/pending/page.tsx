'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { Job, JobFilters } from 'src/types/approval';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { useRejectJob, useApproveJob, usePendingJobs } from 'src/lib/hooks/use-approval';

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

export default function PendingJobsPage() {
  const router = useRouter();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    approvalStatus: 'PENDING',
  });

  const { data, isLoading, error } = usePendingJobs(filters);
  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const approveJobMutation = useApproveJob();
  const rejectJobMutation = useRejectJob();

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

  const handleApprove = async (job: Job) => {
    setSelectedJob(job);
    setApproveConfirmOpen(true);
  };

  const handleReject = async (job: Job) => {
    setSelectedJob(job);
    setRejectDialogOpen(true);
  };

  const handleView = (job: Job) => {
    router.push(paths.dashboard.approvals.jobs.details(job.id));
  };

  const confirmApprove = async () => {
    if (!selectedJob) return;

    try {
      await approveJobMutation.mutateAsync(selectedJob.id);

      toast.success(
        `${selectedJob.jobTitle} at ${selectedJob.company?.name} has been approved successfully! It is now live for job seekers.`
      );
      setApproveConfirmOpen(false);
      setSelectedJob(null);
    } catch (approveError: any) {
      console.error('Failed to approve job:', approveError);
      const errorMessage =
        approveError?.response?.data?.message || approveError?.message || 'Failed to approve job';
      toast.error(`Approval failed: ${errorMessage}`);
    }
  };

  const confirmReject = async () => {
    if (!selectedJob || !rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }

    try {
      await rejectJobMutation.mutateAsync({
        jobId: selectedJob.id,
        data: { rejectionReason },
      });

      toast.success(
        `${selectedJob.jobTitle} at ${selectedJob.company?.name} has been rejected. The company has been notified with the reason.`
      );
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedJob(null);
    } catch (rejectError: any) {
      console.error('Failed to reject job:', rejectError);
      const errorMessage =
        rejectError?.response?.data?.message || rejectError?.message || 'Failed to reject job';
      toast.error(`Rejection failed: ${errorMessage}`);
    }
  };

  const columns: GridColDef<Job>[] = useMemo(
    () => [
      {
        field: 'jobTitle',
        headerName: 'Job',
        flex: 2,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
            <Avatar
              src={params.row.company?.logo}
              alt={params.row.company?.name}
              variant="rounded"
              sx={{ width: 32, height: 32, flexShrink: 0 }}
            >
              {params.row.company?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {params.row.jobTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {params.row.company?.name}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'workType',
        headerName: 'Work Type',
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value}
            color="primary"
            variant="soft"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'contractType',
        headerName: 'Contract',
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value}
            color="secondary"
            variant="soft"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'experienceLevel',
        headerName: 'Experience',
        width: 120,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
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
              approveJobMutation.isPending &&
              selectedJob?.id === params.row.id &&
              params.row.approvalStatus === 'PENDING'
            }
          />,
          <GridActionsCellItem
            icon={<Iconify icon="eva:close-fill" />}
            label="Reject"
            onClick={() => handleReject(params.row)}
            disabled={
              rejectJobMutation.isPending &&
              selectedJob?.id === params.row.id &&
              params.row.approvalStatus === 'PENDING'
            }
          />,
        ],
      },
    ],
    [
      approveJobMutation.isPending,
      rejectJobMutation.isPending,
      selectedJob?.id,
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
          heading="Pending Job Approvals"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Approvals', href: paths.dashboard.approvals.root },
            { name: 'Jobs' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <EmptyContent title="Error" description="Failed to load jobs" />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Pending Job Approvals"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Approvals', href: paths.dashboard.approvals.root },
          { name: 'Jobs' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <CustomDataGrid
            data={jobs}
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
        title="Approve Job"
        content={
          selectedJob && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to approve <strong>{selectedJob.jobTitle}</strong> at{' '}
                <strong>{selectedJob.company?.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once approved, this job will be visible to all job seekers and they can apply for
                it.
              </Typography>
            </Box>
          )
        }
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={confirmApprove}
            loading={approveJobMutation.isPending}
            startIcon={<Iconify icon="eva:checkmark-fill" />}
          >
            Approve Job
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
            Reject Job
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedJob && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                You are about to reject <strong>{selectedJob.jobTitle}</strong> at{' '}
                <strong>{selectedJob.company?.name}</strong>.
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
            loading={rejectJobMutation.isPending}
            disabled={!rejectionReason.trim()}
            startIcon={<Iconify icon="eva:close-fill" />}
          >
            Reject Job
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
