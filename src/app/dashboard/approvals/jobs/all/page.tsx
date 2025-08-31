'use client';

import type { Job } from 'src/types/approval';
import type { GridColDef } from '@mui/x-data-grid';

import { useMemo, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
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
import { useAllJobs, useRejectJob, useApproveJob } from 'src/lib/hooks/use-approval';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDataGrid from 'src/components/data-grid/custom-datagrid';

// ----------------------------------------------------------------------

export default function AllJobsPage() {
  const router = useRouter();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, error } = useAllJobs();
  const jobs = data?.jobs || [];
  const pagination = data?.pagination;
  const approveJobMutation = useApproveJob();
  const rejectJobMutation = useRejectJob();

  const handleApprove = useCallback(async (job: Job) => {
    setSelectedJob(job);
    setApproveConfirmOpen(true);
  }, []);

  const handleReject = useCallback(async (job: Job) => {
    setSelectedJob(job);
    setRejectDialogOpen(true);
  }, []);

  const handleView = useCallback(
    (job: Job) => {
      router.push(paths.dashboard.approvals.jobs.details(job.id));
    },
    [router]
  );

  const confirmApprove = async () => {
    if (!selectedJob) return;

    try {
      await approveJobMutation.mutateAsync(selectedJob.id);
      console.log('Job approved successfully!');
      setApproveConfirmOpen(false);
      setSelectedJob(null);
    } catch (approveError: any) {
      console.error('Failed to approve job:', approveError?.message || approveError);
    }
  };

  const confirmReject = async () => {
    if (!selectedJob || !rejectionReason.trim()) {
      console.warn('Please provide a rejection reason');
      return;
    }

    try {
      await rejectJobMutation.mutateAsync({
        jobId: selectedJob.id,
        data: { rejectionReason },
      });
      console.log('Job rejected successfully!');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedJob(null);
    } catch (rejectError: any) {
      console.error('Failed to reject job:', rejectError?.message || rejectError);
    }
  };

  const columns: GridColDef<Job>[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Job Title',
        flex: 2,
        minWidth: 180,
        renderCell: (params) => (
          <Stack direction="column" gap={0.5} width="100%">
            <Typography variant="subtitle2" noWrap>
              {params.row.jobTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.company?.name || 'N/A'}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'subCategories',
        headerName: 'Categories',
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
          const categories = Array.isArray(params.value) ? params.value : [params.value];
          const displayCount = 2;
          const visibleCategories = categories.slice(0, displayCount);
          const remainingCount = categories.length - displayCount;

          return (
            <Stack direction="row" gap={0.5} alignItems="center" width="100%">
              {visibleCategories.map((cat, index) => (
                <Chip
                  key={index}
                  label={cat.name}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              ))}
              {remainingCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  +{remainingCount}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        field: 'workType',
        headerName: 'Work Type',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={
              params.value === 'REMOTE' ? 'success' : params.value === 'HYBRID' ? 'info' : 'default'
            }
            variant="soft"
          />
        ),
      },
      {
        field: 'experienceLevel',
        headerName: 'Level',
        width: 90,
        renderCell: (params) => (
          <Label
            variant="soft"
            color={
              (params.value === 'SENIOR' && 'error') ||
              (params.value === 'MID' && 'warning') ||
              (params.value === 'JUNIOR' && 'success') ||
              'default'
            }
          >
            {params.value}
          </Label>
        ),
      },
      {
        field: 'approvalStatus',
        headerName: 'Status',
        width: 100,
        renderCell: (params) => (
          <Label
            variant="soft"
            color={
              (params.value === 'APPROVED' && 'success') ||
              (params.value === 'PENDING' && 'warning') ||
              (params.value === 'REJECTED' && 'error') ||
              'default'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {params.value}
          </Label>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Posted',
        width: 90,
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
            showInMenu
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
            showInMenu
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
        <EmptyContent
          filled
          title="Error Loading Jobs"
          description="Failed to load jobs. Please try again."
          action={
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              startIcon={<Iconify icon="eva:refresh-fill" />}
            >
              Retry
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="All Jobs"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Approvals', href: paths.dashboard.approvals.root },
          { name: 'Jobs', href: paths.dashboard.approvals.jobs.root },
          { name: 'All' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.approvals.jobs.pending)}
          >
            View Pending
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 600, width: '100%' }}>
        <CustomDataGrid
          data={jobs}
          columns={columns}
          loading={isLoading}
          pagination={pagination}
          serverSide={false}
        />
      </Card>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => {
          setApproveConfirmOpen(false);
          setSelectedJob(null);
        }}
        title="Approve Job"
        content={
          selectedJob
            ? `Are you sure you want to approve "${selectedJob.jobTitle}"? This action cannot be undone and the job will be visible to all users.`
            : ''
        }
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={confirmApprove}
            loading={approveJobMutation.isPending}
          >
            Approve Job
          </LoadingButton>
        }
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectionReason('');
          setSelectedJob(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Job</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {selectedJob &&
              `Are you sure you want to reject "${selectedJob.jobTitle}"? Please provide a detailed reason for rejection.`}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why this job is being rejected..."
            helperText="This reason will be sent to the company and the job will not be visible to users."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            onClick={confirmReject}
            loading={rejectJobMutation.isPending}
          >
            Reject Job
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
